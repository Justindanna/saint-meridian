# Saint Meridian Store

GitHub-ready Next.js storefront for Saint Meridian.

## Included

- High-quality product images in `public/images`
- Professional black and white storefront
- Size selector: S, M, L, XL, XXL
- On-site customer support chat with no email button and no Google redirect
- Checkout route at `/api/checkout`
- No checkout API keys shown on the website

## Upload to GitHub

1. Extract this ZIP.
2. Open the extracted folder.
3. Select everything inside the folder.
4. Drag the files/folders into GitHub.
5. Commit directly to the `main` branch.

## Vercel checkout setup

Add these Environment Variables in Vercel Project Settings:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`

Example for `NEXT_PUBLIC_SITE_URL`: your live domain, such as `https://saint-meridian.com`

Then redeploy.
