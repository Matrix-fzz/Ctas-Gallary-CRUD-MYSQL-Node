# Deployment & Local Testing (Cloudflare Workers + D1 + Assets)

## Quick checklist ✅

1. Install dependencies:
   ```bash
   npm install
   ```
2. Log in to Cloudflare (if not already):
   ```bash
   npx wrangler login
   ```
3. Run locally (wrangler dev will provide bindings like D1/ASSETS from your account):
   ```bash
   npm run dev
   ```
4. Verify endpoints:
   - GET `/` -> JSON welcome
   - GET `/debug/ping` -> `pong`
   - GET `/debug/db` -> shows whether DB and ASSETS bindings are present
   - GET `/index.html` -> served from `ASSETS` binding

5. Deploy to Cloudflare:
   ```bash
   npm run deploy
   ```

## Notes & Recommendations 💡

- The app uses `express` + `serverless-http` for compatibility. For smaller bundle sizes and better runtime compatibility with Workers, consider migrating to `hono`.
- Ensure your D1 database is configured and the `database_id` in `wrangler.jsonc` is correct.
- `public/` is configured as `assets` in `wrangler.jsonc` and is served via the `ASSETS` binding at runtime.

If you'd like, I can:
- Run through a migration to `hono` (smaller bundle and less polyfills), or
- Add automated tests that run in the `wrangler dev` environment.
