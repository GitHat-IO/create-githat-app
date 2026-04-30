# GitHat Templates

GitHat's create-githat-app ships a Vercel-style template gallery.
Every template is a *complete*, *deployable* example of what you can
build on the GitHat stack — auth (GitHat), hosting (GitHat), database
(bring-your-own or GitHat customer-data), payments (Sebastn), email
(GitHat email), agent identity (Web4 / MCP).

The point is **demonstration through code**: a developer who's never
heard of GitHat scaffolds a template, runs `npm install && npm run
dev`, and sees the platform working. No reading required.

## The lineup

| # | Template | Flag | What it demonstrates | Replaces |
|---|---|---|---|---|
| 1 | **plain** | `--plain` | Auth + a homepage. Smallest possible GitHat app. | "Hello world" |
| 2 | **saas** | `--saas` | Orgs, teams, RBAC, subscription billing via Sebastn. | Clerk + Stripe + Vercel + a starter kit |
| 3 | **marketplace** | `--marketplace` | Multi-vendor commerce. Anonymous-first browsing, auth-as-needed at checkout, Sebastn Connect for seller payouts. | Shopify + Stripe Connect + Vercel |
| 4 | **ai-agent** | `--agent` | Web4 wallet-bound autonomous agent, MCP server registration, public verification at /verify. | LangChain Hub + a key-management tool |
| 5 | **content** | `--content` | Paywalled posts, newsletter, one-time purchases via Sebastn. | Substack + Stripe + Ghost |
| 6 | **dashboard** | `--dashboard` | Admin UI over your existing PostgreSQL / MySQL / DynamoDB, auth-gated. | Retool + Auth0 + Vercel |

(`--ts` / `--js` and `-y` work for all six. `npx create-githat-app my-thing --<flag>` is the cold-start command.)

## Why these six

GitHat replaces Vercel + Supabase by consolidating six categories of
infrastructure into one platform. Each template is a category showing
that consolidation in action:

- **plain** is the empty room.
- **saas** is auth + payments. The thing every B2B starter kit charges
  $99 for.
- **marketplace** is the *hard mode* of e-commerce: many sellers,
  one storefront. Stripe Connect alone is two weeks of integration;
  Sebastn ships it.
- **ai-agent** is the only template in the gallery that touches Web4.
  Demonstrates that GitHat is the only auth platform with public
  agent verification.
- **content** is a creator-economy starter. Auth-gated reads, Sebastn
  handling tips and subscriptions, GitHat email for the newsletter.
- **dashboard** is the "I already have data, I just want auth on it"
  story. Bring-your-own database, GitHat handles identity.

A developer landing on githat.io sees these six and immediately knows
what they could build. They pick one, scaffold, and the project
*runs*. That's the whole pitch.

## File-count discipline

Each template should keep file count proportional to its scope:

| Template | Target file count |
|---|---|
| plain | 12–15 |
| dashboard | 18–22 |
| content | 22–26 |
| ai-agent | 25–30 |
| saas | 28–32 |
| marketplace | 30–35 |

If a template grows past these targets, it's doing too much and we
should split functionality into a *recipe* (a doc describing how to
add a feature) rather than baking it in.

## Cultural choices

The **marketplace** template ships with a Latin American framing
(category seed data, microcopy, default brand palette) because the
first real consumer is Colmado — a Dominican-flavored bodega
marketplace. See `templates/marketplace/CULTURE.md` for the
research that shaped the defaults. Anglo developers running this
template will get bilingual copy out of the box; that's a feature,
not a bug — most US neighborhoods that need a marketplace template
*are* multilingual.

Other templates default to English. Where the template's domain
implies a region (none currently), document that in its CULTURE.md.

## Adding a new template

1. Copy `templates/plain/` to `templates/<name>/` as a starting point
2. Add the routes/components your template needs (keep file count in
   the target band above)
3. Register the framework value in `src/utils/template-engine.ts`'s
   `TemplateContext.framework` union
4. Add a `--<flag>` option in `src/cli.ts`
5. Wire the flag through `runPrompts` and `getDefaults` in
   `src/prompts/index.ts`
6. Add the option to the `frameworkOptions` array in
   `src/prompts/framework.ts`
7. Update `package-builder.ts` if the template needs different deps
8. Write a `templates/<name>/CULTURE.md` if there are regional choices
9. Add a row to the lineup table at the top of THIS file
10. Bump version, build, manually test all the way to `npm run build`
