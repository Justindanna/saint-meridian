# Saint Meridian Store

GitHub-ready Next.js store for Saint Meridian.

## What is fixed

- Customer Service opens directly inside the website.
- No customer-service button redirects to Google.
- Support agent answers order numbers, sizes, and delivery time questions.
- Sizes: S, M, L, XL, XXL.
- Order times: 3–5 business days.
- Checkout uses `/api/checkout` and does not show checkout secrets on the website.

## Vercel setup

Add these environment variables in Vercel:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`

Then redeploy the project.
