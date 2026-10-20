# Shop Online

Arabic multi-category storefront, independent product landing pages, admin dashboard, cash-on-delivery order requests, Google Sheets storage and private GitHub image uploads.

**Current delivery: working local preview and integration code. Live Google Sheets/GitHub image credentials and hosting must be configured before accepting real orders.**

## Run

Node.js 22+ is required. No npm dependencies or database server.

1. Copy `.env.example` to `.env`.
2. Run `npm start` and open http://localhost:3000.
3. The example configuration explicitly enables **read-only demo mode**. Sample products are not real stock. Login, uploads and orders are disabled.
4. Run `npm test` for domain checks.

## Connect Google Sheets

Owner requested: `rouahnaamel1585@gmail.com`.
Spreadsheet supplied by the owner:
https://docs.google.com/spreadsheets/d/1mCEPATCh-imZHRySZUuOFVIqo14uYcRn84ckOwJk9f8/edit

1. In a Google Cloud project, enable Google Sheets API and create a service account.
2. Share **only this spreadsheet** with the service account email as Editor. Keep the spreadsheet private; order records contain customer contact information.
3. Store `SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` in the host's secret environment configuration. Never put a key in source control, a browser script or a chat message.
4. Set `DEMO_MODE=false`; initialize missing tabs with `npm run setup:sheets`.
5. The initializer creates missing `Products`, `Orders` and `Settings` tabs with `id` and `data_json` columns. It does not overwrite existing tabs. Existing tabs with these names must use that schema; use another sheet if they contain unrelated data.

Products, order requests, categories (derived from products), and store settings live in Sheets. Product images live in GitHub. Only the anonymous cart stays in the customer's browser. Sessions are signed cookies, not Sheets records; credentials remain private host configuration.

## Admin and product images

1. On your own private terminal run `npm run setup:password`. Enter a strong password yourself; this utility prints the salted password hash and a session secret to put in the host configuration. Terminal input is visible.
2. Set `ADMIN_PASSWORD_HASH` and `SESSION_SECRET` (at least 48 random characters).
3. Create a fine-grained GitHub token restricted to `azzeddinecharef-netizen/shop.online`, Contents read/write only. Keep `GITHUB_TOKEN` on the server. The assistant does not need a separate GitHub identity or permanent collaborator access.
4. Admin login is at `/admin`. This first version uses one store-admin password, **not Google sign-in**. The requested Gmail is the owner contact, not an implemented OAuth login.
5. Upload JPEG/PNG/WebP (up to 3 MB each, 8 per product). Files go to `media/<uuid>.<ext>` on the configured branch. Saving a product writes its image paths to Sheets. Removing an image from a product does not delete the versioned GitHub file.
6. Public image responses are served by the Node server only when referenced by an active, in-stock product. Private GitHub repository URLs and tokens are not exposed.

## Deploy

Run on a Node.js-capable host (Hostinger VPS/Node hosting or another Node service) behind HTTPS. GitHub Pages alone cannot execute this server. No hosting subscription has been purchased and no public domain has been configured.

- Set the exact HTTPS `BASE_URL`; mutations from another origin are rejected.
- Use one Node process and reverse proxy to `127.0.0.1:3000`.
- Set `DEMO_MODE=false`, configure all secrets, then `npm start`.
- Reverse proxy must preserve the browser Origin header and enforce request limits. The process limiter deliberately does not trust unverified forwarded IP headers; behind one proxy its limits are shared.
- Run one instance: Google Sheets has no cross-process transactions. This version is for a small, low-traffic store.
- Orders are **requests pending manual confirmation**, not reserved inventory. Verify stock and delivery charge before confirming, then update stock in admin. No automatic card payments.
- Back up the Sheet, restrict access to the owner/admin, and define a customer data retention policy before launch.
- Smoke-test real product create/edit, image upload, category filtering and an order on a test sheet before public launch.

## Source research

We reviewed [Epic Design Labs' Next.js ecommerce starter](https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter), [Vercel Commerce](https://github.com/vercel/commerce), and [Next.js Commerce Sheets](https://github.com/goncy/nextjs-commerce-sheets).

The Epic starter has a useful storefront/admin and data-repository structure, but its demo authentication and locally stored orders do not meet this project's requirements. This implementation uses original dependency-free Node and browser code with a Sheets data adapter instead of copying its demo auth or claiming that its local data is connected. No third-party source assets are incorporated.

## Checks and limits

`npm test` checks category visibility, stable unique product URLs, server-side price calculation, aggregated stock checks and input validation. Integration requires real service credentials and has not been verified merely by the local demo.

No users beyond the repository owner have been invited. Add named collaborators only with the owner's approval.
