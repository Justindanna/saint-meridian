import Stripe from 'stripe';

const products = {
  'saint-meridian-hoodie-black': { name: 'Saint Meridian Hoodie - Black', price: 8000 },
  'saint-meridian-hoodie-white': { name: 'Saint Meridian Hoodie - White', price: 8000 },
  'saint-meridian-shirt-black': { name: 'Saint Meridian T-Shirt - Black', price: 5000 },
  'saint-meridian-shirt-white': { name: 'Saint Meridian T-Shirt - White', price: 5000 }
};

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe secret key is not set in Vercel.' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { items = [] } = await request.json();

    const line_items = items.map((item) => {
      const product = products[item.id];
      if (!product) throw new Error('Invalid product.');
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.name} / ${item.size || 'M'}`
          },
          unit_amount: product.price
        },
        quantity: 1
      };
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message || 'Checkout failed.' }, { status: 500 });
  }
}
