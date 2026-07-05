import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const products = {
  'white-hoodie': { name: 'Saint Meridian Hoodie - White', price: 10000, image: '/images/white-hoodie.png' },
  'black-hoodie': { name: 'Saint Meridian Hoodie - Black', price: 10000, image: '/images/black-hoodie.png' },
  'white-tee': { name: 'Saint Meridian T-Shirt White', price: 7500, image: '/images/white-tee.png' },
  'black-tee': { name: 'Saint Meridian T-Shirt Black', price: 7500, image: '/images/black-tee.png' }
};

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Checkout is not configured yet. Add STRIPE_SECRET_KEY in Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await request.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];

    const cleanCart = cart
      .map((item) => ({
        id: String(item.id || ''),
        size: String(item.size || 'M').toUpperCase(),
        quantity: Math.max(1, Math.min(10, Number(item.quantity || 1)))
      }))
      .filter((item) => products[item.id]);

    if (!cleanCart.length) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: cleanCart.map((item) => {
        const product = products[item.id];
        return {
          quantity: item.quantity,
          price_data: {
            currency: 'usd',
            unit_amount: product.price,
            product_data: {
              name: `${product.name} / Size ${item.size}`,
              images: [`${origin}${product.image}`]
            }
          }
        };
      }),
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
      shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: { enabled: true }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Checkout failed.' }, { status: 500 });
  }
}
