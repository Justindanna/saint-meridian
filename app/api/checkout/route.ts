import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const products: Record<string, { name: string; price: number }> = {
  'white-hoodie': { name: 'Saint Meridian Hoodie - White', price: 39800 },
  'black-hoodie': { name: 'Saint Meridian Hoodie - Black', price: 31800 },
  'white-shirt': { name: 'Saint Meridian T-Shirt White', price: 31800 },
  'black-shirt': { name: 'Saint Meridian T-Shirt black', price: 31800 }
};

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe is not configured yet.' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);
    const body = await req.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];

    if (!cart.length) {
      return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
    }

    const line_items = cart.map((item: { id: string; size?: string; quantity?: number }) => {
      const product = products[item.id];
      if (!product) throw new Error('Invalid product selected.');
      const size = item.size || 'M';
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: `${product.name} - Size ${size}` },
          unit_amount: product.price
        },
        quantity: Math.max(1, Number(item.quantity || 1))
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
