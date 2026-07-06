# Saint Meridian

GitHub-ready Next.js website with checkout fixed.

Checkout fix:
- Rebuilt `/app/api/checkout/route.js`
- Accepts cart items from the site
- Sends correct prices to Stripe:
  - T-shirts: $50
  - Hoodies: $80
- Uses the Vercel environment variable `STRIPE_SECRET_KEY`
- Preserves the product mockups and professional support chat

IMPORTANT:
Make sure Vercel has this environment variable:
`STRIPE_SECRET_KEY`

Upload the extracted contents to GitHub, commit to `main`, then Vercel should redeploy automatically.
