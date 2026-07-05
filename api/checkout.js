const Stripe = require('stripe');

const products = {
  'black-hoodie': { name: 'Saint Meridian Hoodie - Black', price: 10000 },
  'white-hoodie': { name: 'Saint Meridian Hoodie - White', price: 10000 },
  'black-tee': { name: 'Saint Meridian T-Shirt - Black', price: 7500 },
  'white-tee': { name: 'Saint Meridian T-Shirt - White', price: 7500 }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe secret key is missing in Vercel Environment Variables.' });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://saint-meridian.com';

    const line_items = cart.map((item) => {
      const product = products[item.id];
      if (!product) return null;
      const size = ['S','M','L','XL','XXL'].includes(item.size) ? item.size : 'M';
      return {
        quantity: Math.max(1, Math.min(10, Number(item.qty) || 1)),
        price_data: {
          currency: 'usd',
          unit_amount: product.price,
          product_data: { name: `${product.name} / Size ${size}` }
        }
      };
    }).filter(Boolean);

    if (!line_items.length) return res.status(400).json({ error: 'Cart is empty.' });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`,
      shipping_address_collection: { allowed_countries: ['US'] }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Checkout failed.' });
  }
};
