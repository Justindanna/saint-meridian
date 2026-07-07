import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const allowedProducts = {
  'Saint Meridian Hoodie - Black': { name: 'Saint Meridian Hoodie - Black', price: 80 },
  'Saint Meridian Hoodie - White': { name: 'Saint Meridian Hoodie - White', price: 80 },
  'Saint Meridian T-Shirt - Black': { name: 'Saint Meridian T-Shirt - Black', price: 50 },
  'Saint Meridian T-Shirt - White': { name: 'Saint Meridian T-Shirt - White', price: 50 }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!items.length) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    const origin =
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://saint-meridian.com';

    const cleanItems = items.map((item) => {
      const product = allowedProducts[item.name];
      if (!product) throw new Error(`Invalid product: ${item.name}`);

      return {
        name: product.name,
        size: item.size || 'M',
        quantity: item.quantity || 1,
        price: product.price
      };
    });

    const line_items = cleanItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.name} - Size ${item.size}`
        },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${origin}?checkout=success`,
      cancel_url: `${origin}?checkout=cancelled`,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US']
      },
      metadata: {
        cart: JSON.stringify(cleanItems)
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Checkout failed.' },
      { status: 500 }
    );
  }
}
