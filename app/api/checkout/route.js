import Stripe from 'stripe';

const products = {
  'black-hoodie': { name: 'Saint Meridian Hoodie — Black', price: 10000 },
  'white-hoodie': { name: 'Saint Meridian Hoodie — White', price: 10000 },
  'black-tee': { name: 'Saint Meridian T-Shirt — Black', price: 7500 },
  'white-tee': { name: 'Saint Meridian T-Shirt — White', price: 7500 }
};

export async function POST(request) {
  try {
    const { productId, size } = await request.json();
    const product = products[productId];
    const allowedSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    if (!product || !allowedSizes.includes(size)) {
      return Response.json({ error: 'Please select a valid product and size.' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: 'Checkout is not configured in Vercel yet.' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${product.name} / Size ${size}` },
            unit_amount: product.price
          },
          quantity: 1
        }
      ],
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`,
      metadata: { productId, size }
    });

    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: 'Checkout could not be started. Please try again.' }, { status: 500 });
  }
}
