# Saint Meridian Deploy-Ready Site

This is a Vercel-ready static storefront with a serverless Stripe checkout endpoint.

## Important
Upload these extracted files to GitHub. This project intentionally has **no package.json** and **no package-lock.json** so Vercel does not run npm install.

## Files included
- index.html
- styles.css
- app.js
- vercel.json
- api/checkout.js
- public/images/product images

## Vercel environment variables
Keep these inside Vercel only:
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_SITE_URL = https://saint-meridian.com

No API keys are shown on the website.
