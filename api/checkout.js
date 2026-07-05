export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`;
  if (!secret) return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY in Vercel Environment Variables.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const items = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) return res.status(400).json({ error: 'Cart is empty.' });
    const allowed = new Map([
      ['white-hoodie', { name: 'Saint Meridian Hoodie - White', price: 100 }],
      ['black-hoodie', { name: 'Saint Meridian Hoodie - Black', price: 100 }],
      ['white-tee', { name: 'Saint Meridian T-Shirt White', price: 75 }],
      ['black-tee', { name: 'Saint Meridian T-Shirt Black', price: 75 }]
    ]);
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${siteUrl}/?success=true`);
    params.append('cancel_url', `${siteUrl}/?canceled=true`);
    items.forEach((item, idx) => {
      const product = allowed.get(item.id);
      if (!product) return;
      const size = ['S','M','L','XL','XXL'].includes(item.size) ? item.size : 'M';
      const quantity = Math.max(1, Math.min(Number(item.quantity || 1), 10));
      params.append(`line_items[${idx}][quantity]`, String(quantity));
      params.append(`line_items[${idx}][price_data][currency]`, 'usd');
      params.append(`line_items[${idx}][price_data][unit_amount]`, String(product.price * 100));
      params.append(`line_items[${idx}][price_data][product_data][name]`, `${product.name} / Size ${size}`);
    });
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const data = await stripeRes.json();
    if (!stripeRes.ok) return res.status(500).json({ error: data.error?.message || 'Stripe checkout failed.' });
    return res.status(200).json({ url: data.url });
  } catch (error) {
    return res.status(500).json({ error: 'Checkout server error.' });
  }
}
