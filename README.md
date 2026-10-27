# Posygo — Web

The web app for vendors, warehouse operators and the platform team. It talks to the API project, `global-fulfilment-api`, which is deployed separately.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind 3 · TanStack Query · React Hook Form · Zod 4 · the Posy design system on a white page background

```
src/app          Routes: (marketing), (auth), (portal) for vendors, (console) for the platform team and fulfilment partners (partners get their own menu, scoped to their warehouse)
src/features     Screens grouped by area
src/components   Posy components (ui), layout and brand
src/shared       Contracts shared with the API (keep identical; see below)
src/styles       Design tokens from Posy
```

## Requirements

Node 22, npm 10, and the API running locally (see its README).

## First run

```bash
npm install
cp .env.example .env.local      # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_STORAGE_ORIGIN
npm run dev                     # http://localhost:3000
```

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run audit:prod
```

## Browser tests

The browser suite signs in as every role (super admin, admin, finance, compliance, country ops, warehouse operator, vendor owner and member, partner lead and staff), checks what each can see and call, walks a lost-stock claim from transfer to wallet credit, and runs a vendor store from opening through a buyer's paid order, a discount code, a finance refund and a buyer's return, and a customer return from the order through the hub's blind count to back on sale, with the vendor's notification and CSV downloads, referral codes and campaigns, and a personal shopping request from the buyer's links through pricing, payment, buying and booking in to the parcel leaving the warehouse.

1. Start the API and this app locally (`npm run build && npm start`), with the API pointing at a throwaway local database.
2. Install the browser once: `npx playwright install chromium`.
3. Run `npm run test:browser`.

Before each run the suite calls the API's `npm run seed:e2e`, which creates or resets the `@e2e.gfn.local` accounts, a test partner hub with stock and a funded test vendor, and clears local rate limits. It refuses to run against production or a non-local database. Set `E2E_API_DIR` if the API isn't in `../global-fulfilment-api`, and `E2E_PASSWORD` / `E2E_TOTP_SECRET` to override the test credentials. Failures leave screenshots and traces in `e2e/results`.

## Search and AI visibility

Public pages are rendered on the server, so search engines and AI assistants read real content without running JavaScript. `e2e/seo.e2e.ts` reads every page in the sitemap the way a crawler does and fails if any page breaks these rules.

Every new public page must:

1. Export `metadata` (or `generateMetadata`) built with `publicPage()` from `src/lib/site.ts`: a unique title under 80 characters, a description of 50 to 200 characters written for the person searching, and its own path for the canonical link.
2. Have exactly one `<h1>`, with the words people actually search for. US pages say "fulfillment"; other markets say "fulfilment" (`fulfilmentWord()`).
3. Add structured data with `<JsonLd>` and the builders in `src/lib/structured-data.ts` (Service, FAQPage, OfferCatalog, Article, BreadcrumbList).
4. Use only facts and prices that come from the API or the code. Never type a price into page copy.
5. Be listed in `src/features/marketing/site-pages.ts`, which feeds `sitemap.xml`, `llms.txt` and `llms-full.txt`, and linked from the header, footer or another public page.

Private areas inherit `PRIVATE_PAGE` (noindex) from their layout and are listed in `PRIVATE_PATHS`, which `robots.txt` blocks. `robots.txt` names the main AI crawlers explicitly and allows them on public pages. Set `NEXT_PUBLIC_SITE_URL` to the live address in each deployment so canonical links, the sitemap and sharing images point at the right domain.

## The in-app helper

Posy, the flower in the bottom-left corner, explains pages and fields, notices when someone is stuck or hits an error, tells them whether it's their input or our system, and reports system failures to support with the steps that led there. It lives in `src/features/assistant`.

What it knows comes from knowledge files written next to each page (`*.knowledge.ts`), listed in `src/features/assistant/knowledge/registry.ts`, and from the shared error guide (`src/shared/http/error-guide.ts`). It never reads what people type into forms, only field labels.

Every new page must:

1. Have a knowledge file (`*.knowledge.ts`) next to its feature code, built with `describePage<TheFormInput>()` when it has a form. TypeScript refuses it if any field of the form's input type is missing. Field help can carry a `fix` that offers to correct a format mistake when the person taps yes; it runs only in their browser.
2. Be imported in `src/features/assistant/knowledge/registry.ts`. `registry.test.ts` fails if any page in `src/app` has no notes, or two notes claim the same page.
3. Be added to the page lists in `e2e/helper.e2e.ts`, which opens each page as the right kind of user and fails if any visible field has no explanation.

The helper can also walk people through a page field by field, point at a field, and talk. Voice uses the browser's own speech, so nothing is recorded or sent anywhere; people choose "Talk to me" or "I prefer typing" the first time, and can switch at the top of the chat.

Every new error code needs an entry in the shared error guide, and every order or stock shipment stage an entry in the shared stage guide; neither builds without them.

When the API has answers switched on, questions the written notes don't cover go to the AI, which reads the same notes from `/assistant-knowledge.json` (built from the registry, the guides and the FAQs). If it isn't sure, the person is offered the team.

## Design system

Every card, note, tile, band and control follows Posy's light palette; only the page background is white. Colours, shadows and radii come from `src/styles/tokens.css` through Tailwind theme keys. Components never set their own hex values.

## Shared contracts

`src/shared` is a copy of the API's `src/shared` (without tests). Change it in the API project first, copy it here, then run `npm run shared:check` (it expects the API project next to this one, or pass its `src/shared` path as an argument).

## Security

A nonce-based Content Security Policy is set per request in `src/middleware.ts`, with strict security headers in `next.config.mjs`. Access tokens live only in memory; the refresh token is an HttpOnly cookie scoped to the API.

Card top-ups leave the app for the payment provider's checkout page. The app only follows that link when it points back to itself (the practice checkout used in test mode) or to `checkout.stripe.com`; add any new provider's checkout host to `CHECKOUT_HOSTS` in `src/features/finance/use-vendor-wallet.ts`. The browser never sees card details.
