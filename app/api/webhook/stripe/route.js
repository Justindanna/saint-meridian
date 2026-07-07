import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let cachedStoreId = null;

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

async function getPrintfulStoreId() {
  if (cachedStoreId) return cachedStoreId;

  const res = await fetch('https://api.printful.com/stores', {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`
    }
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || 'Could not get Printful store ID');
  }

  const stores = Array.isArray(data?.result) ? data.result : [];
  const store = stores.find((s) => s.name === 'Basic T-Shirts') || stores[0];

  if (!store?.id) {
    throw new Error('Printful store ID not found');
  }

  cachedStoreId = store.id;
  return cachedStoreId;
}

async function printfulFetch(path, options = {}) {
  const storeId = await getPrintfulStoreId();

  const res = await fetch(`https://api.printful.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
      'X-PF-Store-Id': String(storeId),
      ...(options.headers || {})
    }
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || 'Printful API error');
  }

  return data;
}

function variantMatchesSize(variant, requestedSize) {
  const size = normalizeText(requestedSize);
  const name = normalizeText(variant?.name);
  const variantSize = normalizeText(variant?.size);
  const externalVariantName = normalizeText(variant?.external_variant_name);

  return (
    variantSize === size ||
    externalVariantName === size ||
    name === size ||
    name.endsWith(` / ${size}`) ||
    name.endsWith(`/${size}`) ||
    name.endsWith(` ${size}`) ||
    name.includes(` / ${size} /`) ||
    name.includes(` size ${size}`)
  );
}

async function getSyncVariantId(productName, size) {
  const products = await printfulFetch('/store/products');
  const productList = Array.isArray(products?.result) ? products.result : [];

  const product = productList.find(
    (p) => normalizeText(p.name) === normalizeText(productName)
  );

  if (!product) {
    throw new Error(`Printful product not found: ${productName}`);
  }

  const details = await printfulFetch(`/store/products/${product.id}`);
  const variants = Array.isArray(details?.result?.sync_variants)
    ? details.result.sync_variants
    : [];

  const variant = variants.find((v) => variantMatchesSize(v, size));

  if (!variant) {
    const available = variants.map((v) => v.name || v.size || v.id).join(', ');
    throw new Error(
      `Printful size not found: ${productName} / ${size}. Available variants: ${available}`
    );
  }

  return variant.id;
}

export async function POST(request) {
  try {
    const sig = request.headers.get('stripe-signature');
    const rawBody = await request.text();

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['customer_details']
    });

    const cart = JSON.parse(fullSession.metadata?.cart || '[]');
    const customer = fullSession.customer_details;
    const address = customer?.address;

    if (!Array.isArray(cart) || !cart.length) {
      throw new Error('Missing cart metadata.');
    }

    if (!customer?.name || !customer?.email || !address) {
      throw new Error('Missing customer shipping info.');
    }

    const printfulItems = await Promise.all(
      cart.map(async (item) => ({
        sync_variant_id: await getSyncVariantId(item.name, item.size),
        quantity: item.quantity || 1,
        retail_price: String(item.price)
      }))
    );

    await printfulFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        external_id: `stripe_${session.id.slice(-24)}`,
        confirm: true,
        recipient: {
          name: customer.name,
          email: customer.email,
          address1: address.line1,
          address2: address.line2 || '',
          city: address.city,
          state_code: address.state,
          country_code: address.country,
          zip: address.postal_code
        },
        items: printfulItems
      })
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
