# Saint Meridian Ready Final

Static Vercel-ready storefront with:
- High-quality product images in public/images
- On-site support chat with no Google redirect
- Sizes S, M, L, XL, XXL
- 3-5 business day timing answer
- Stripe checkout serverless function at /api/checkout

## Vercel variables
Add these in Vercel Project Settings > Environment Variables:
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_SITE_URL = https://saint-meridian.com

## Prices
Edit prices in two places:
- app.js for display
- api/checkout.js for Stripe charge amount in cents

Current prices:
- T-shirts: $75
- Hoodies: $100
