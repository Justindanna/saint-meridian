import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let cachedStoreId = null;

async function getPrintfulStoreId() {
  if (cachedStoreId) return cachedStoreId;

  const res = await fetch('https://api.printful.com/stores', {
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.error || 'Could not get Printful store ID');
  }

  const store = data.result.find((s) => s.name === 'Basic T-Shirts') || data.result[0];

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

async function getSyncVariantId(productName, size) {
  const products = await printfulFetch('/store/products');

  const product = products.result.find(
    (p) => p.name.trim().toLowerCase() === productName.trim().toLowerCase()
  );

  if (!product) {
    throw new Error(`Printful product not found: ${productName}`);
  }

  const details = await printfulFetch(`/store/products/${product.id}`);

  const requestedSize = String(size).trim().toLowerCase();

  const variant = details.result.sync_variants.find((v) => {
    const name = String(v.name || '').toLowerCase();
    const variantSize = String(v.size || '').toLowerCase();

    return (
      variantSize === requestedSize ||
      name.includes(` / ${requestedSize}`) ||
      name.endsWith(`/${requestedSize}`) ||
      name.endsWith(` ${requestedSize}`) ||
      name.includes(`size ${requestedSize}`)
    );
  });

  if (!variant) {
    throw new Error(`Printful size not found: ${productName} / ${size}`);
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

    if (!cart.length) {
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
        external_id: session.id,
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
