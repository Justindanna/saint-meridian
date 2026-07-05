# Saint Meridian Full Website

GitHub/Vercel-ready Next.js storefront.

## Correct upload structure

Upload the extracted folder contents while preserving folders:

- `app/`
- `public/`
- `package.json`
- `next.config.js`
- `next-env.d.ts`
- `tsconfig.json`
- `README.md`

Do not move files out of `app` or `public`.

## Pricing

- Saint Meridian Hoodie - White: $398
- Saint Meridian Hoodie - Black: $318
- Saint Meridian T-Shirt White: $318
- Saint Meridian T-Shirt black: $318

## Checkout

The checkout route uses Stripe and reads `STRIPE_SECRET_KEY` from Vercel Environment Variables. It does not store API keys in GitHub.
