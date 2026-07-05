import Stripe from 'stripe';

const products = {
  'black-hoodie': { name: 'Saint Meridian Hoodie - Black', price: 10000 },
  'white-hoodie': { name: 'Saint Meridian Hoodie - White', price: 10000 },
  'black-tee': { name: 'Saint Meridian T-Shirt - Black', price: 7500 },
  'white-tee': { name: 'Saint Meridian T-Shirt - White', price: 7500 }
};

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Stripe secret key is missing in Vercel Environment Variables.' }, { status: 500 });
    }

    const body = await request.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saint-meridian.com';

    const line_items = cart.map((item) => {
      const product = products[item.id];
      if (!product) return null;
      const size = ['S', 'M', 'L', 'XL', 'XXL'].includes(item.size) ? item.size : 'M';
      return {
        quantity: Math.max(1, Math.min(10, Number(item.qty) || 1)),
        price_data: {
          currency: 'usd',
          unit_amount: product.price,
          product_data: { name: `${product.name} / Size ${size}` }
        }
      };
    }).filter(Boolean);

    if (!line_items.length) return Response.json({ error: 'Cart is empty.' }, { status: 400 });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`,
      shipping_address_collection: { allowed_countries: ['US'] }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message || 'Checkout failed.' }, { status: 500 });
  }
}
