<div align="center">

# create-githat-app

**The CLI for [GitHat](https://githat.io) — Auth + Hosting that replaces Clerk + Vercel**

[![npm version](https://img.shields.io/npm/v/create-githat-app?style=flat-square&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/create-githat-app)
[![npm downloads](https://img.shields.io/npm/dm/create-githat-app?style=flat-square&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/create-githat-app)
[![SDK](https://img.shields.io/npm/v/@githat/nextjs?style=flat-square&logo=npm&logoColor=white&label=%40githat%2Fnextjs&color=cb3837)](https://www.npmjs.com/package/@githat/nextjs)
[![Website](https://img.shields.io/website?style=flat-square&url=https%3A%2F%2Fgithat.io&up_message=live&up_color=1f6feb&label=githat.io)](https://githat.io)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](LICENSE)

</div>

---

Scaffold a production-ready app with a fully-managed backend — auth, teams, orgs, API keys, MCP verification, and AI agent identity. **No backend to deploy.**

[GitHat](https://githat.io) is your backend. When you run `create-githat-app`, your generated project connects to GitHat's hosted platform at `api.githat.io`. User accounts, organizations, teams, API keys, MCP servers, and AI agents are all stored and managed by GitHat. You write frontend code only.

## Install & Launch

Run one command from anywhere:

```bash
npx create-githat-app
```

Or with a project name:

```bash
npx create-githat-app my-app
```

Or install globally:

```bash
npm i -g create-githat-app
create-githat-app my-app
```

The CLI launches an interactive wizard that walks you through every decision.

## How It Works

### Step 1 — Answer the prompts

The CLI asks you a series of questions:

```
◆  Project name?
│  my-saas-app
│
◆  Business name?
│  Acme Corp
│
◆  Framework?
│  ● Next.js 16 (App Router)
│  ○ React 19 + Vite 7
│
◆  Language?
│  ● TypeScript
│  ○ JavaScript
│
◆  Package manager?
│  ● npm
│  ○ yarn
│  ○ pnpm
│  ○ bun
│
◆  GitHat publishable key?
│  pk_live_abc123...
│
◆  Auth features to include?
│  ◻ Forgot password
│  ◻ Email verification
│  ◻ Organization management
│  ◻ MCP server identity
│  ◻ AI agent identity
│
◆  Database?
│  ● None
│  ○ Prisma + PostgreSQL
│  ○ Prisma + MySQL
│  ○ Drizzle + PostgreSQL
│  ○ Drizzle + SQLite
│
◆  Include Tailwind CSS 4?
│  ● Yes  ○ No
│
◆  Include platform dashboard?
│  ● Yes  ○ No
│
◆  Initialize git repository?
│  ● Yes  ○ No
│
◆  Install dependencies now?
│  ● Yes  ○ No
```

### Step 2 — Project is generated

```
◇  Project structure created
◇  package.json generated
◇  Git repository initialized
◇  Dependencies installed

◇  Setup complete!
```

### Step 3 — Start building

```bash
cd my-saas-app
npm run dev
```

Your app is running at `http://localhost:3000` with auth, dashboard, and the full GitHat platform wired up.

## CLI Flags

Skip prompts with flags:

```bash
# Use JavaScript instead of TypeScript
npx create-githat-app my-app --js

# Use TypeScript (default)
npx create-githat-app my-app --ts

# Pass your publishable key directly
npx create-githat-app my-app --key pk_live_abc123

# Combine flags
npx create-githat-app my-app --js --key pk_live_abc123

# Show help
npx create-githat-app --help

# Show version
npx create-githat-app --version
```

## What You Get

A production-ready project connected to GitHat's hosted backend:

- **Fully-managed backend** — `api.githat.io` handles auth, orgs, teams, API keys, agents, MCP
- **Auth pages** — sign-in, sign-up, forgot password, email verification
- **Protected dashboard** — sidebar navigation, org switcher, user button
- **`@githat/nextjs` SDK** — `<GitHatProvider>`, `<ProtectedRoute>`, `useAuth()`
- **`githat/` platform folder** — typed API client for all 42+ backend endpoints
- **Dark theme** — zinc/purple design system out of the box
- **Database ready** — Prisma or Drizzle for your app's own data (optional)
- **Tailwind CSS 4** — utility-first styling (optional)

## The `githat/` Folder

Your generated project includes a `githat/` directory — a local integration layer between your app and the GitHat platform API:

```
githat/
  config.ts              # Central configuration (env vars, feature flags)
  api/
    client.ts            # Typed fetch wrapper with token refresh
    types.ts             # TypeScript interfaces for all API responses
    auth.ts              # Login, register, forgot password, verify email
    orgs.ts              # Create/update orgs, invite/remove members
    users.ts             # List orgs, switch org
    mcp.ts               # Register/verify MCP servers
    agents.ts            # Register/verify AI agent wallets
  auth/
    guard.tsx            # Role-based route protection component
    index.ts             # Auth exports
  dashboard/
    layout.tsx           # Dashboard shell with sidebar navigation
    overview.tsx         # Stats overview page
    apps.tsx             # App + API key management
    members.tsx          # Invite members, manage roles, remove
    settings.tsx         # Edit org name, brand color, save
    mcp-servers.tsx      # Register MCP servers, verify, remove
    agents.tsx           # Register AI agent wallets, verify, remove
```

All API calls go to `api.githat.io`. The client handles auth tokens and automatic refresh.

## Your Backend is GitHat

You don't deploy or maintain a backend. GitHat's hosted platform handles:

- **Authentication** — sign-up, sign-in, email verification, password reset
- **Organizations** — create, switch, branding, custom domains
- **Team management** — invite members by email, assign roles (owner/admin/member), remove
- **API key management** — publishable + secret keys per app, rotation
- **MCP server registration** — domain verification via DNS TXT, OAuth2 credentials
- **AI agent registration** — Ethereum wallet verification, challenge-response tokens
- **Email delivery** — verification emails, invitations, password resets (via AWS SES)
- **Database** — users, orgs, teams, apps, agents, MCP servers (DynamoDB, managed by GitHat)
- **Public verification** — anyone can verify an agent or MCP server at `githat.io/verify/`

Your data lives in GitHat's infrastructure. You write frontend code, GitHat handles the rest.

## Three Identity Types

GitHat supports three types of identity in a single platform:

| Type            | Auth Method                | Dashboard Page |
| --------------- | -------------------------- | -------------- |
| **Humans**      | Email + password           | Members        |
| **MCP Servers** | Domain verification        | MCP Servers    |
| **AI Agents**   | Ethereum wallet signatures | AI Agents      |

## Project Structure

### Next.js 16

```
my-app/
  app/
    layout.tsx
    page.tsx
    globals.css
    (auth)/
      sign-in/page.tsx
      sign-up/page.tsx
      forgot-password/page.tsx
      verify-email/page.tsx
    dashboard/
      layout.tsx
      page.tsx
      apps/page.tsx
      members/page.tsx
      settings/page.tsx
      mcp/page.tsx
      agents/page.tsx
  githat/
    ...
  middleware.ts
  next.config.ts
  .env.local
```

### React 19 + Vite 7

```
my-app/
  src/
    main.tsx
    App.tsx
    index.css
    pages/
      Home.tsx
      SignIn.tsx
      SignUp.tsx
      ForgotPassword.tsx
      VerifyEmail.tsx
      Dashboard.tsx
  githat/
    ...
  index.html
  vite.config.ts
  .env.local
```

## Environment Variables

Generated `.env.local`:

```env
# Next.js
NEXT_PUBLIC_GITHAT_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GITHAT_API_URL=https://api.githat.io

# React/Vite
VITE_GITHAT_PUBLISHABLE_KEY=pk_live_...
VITE_GITHAT_API_URL=https://api.githat.io
```

## Documentation

- [GitHat Quick Start](https://githat.io/docs/quickstart) — Get running in 5 minutes
- [SDK Reference](https://githat.io/docs/sdk) — `@githat/nextjs` hooks, components, and server utils
- [API Reference](https://githat.io/docs/api) — All 86 REST endpoints
- [CLI Reference](https://githat.io/docs/cli) — Flags, prompts, and templates
- [Next.js Guide](https://githat.io/docs/nextjs) — Auth in Next.js 14-16+
- [React Guide](https://githat.io/docs/react) — Auth in any React app
- [Bring Your Own Database](https://githat.io/docs/byod) — Keep your PostgreSQL, MySQL, or MongoDB
- [MCP Servers](https://githat.io/docs/mcp) — Domain verification for AI tool servers
- [AI Agents](https://githat.io/docs/agents) — Wallet-based identity for autonomous agents
- [Skills Marketplace](https://githat.io/docs/skills) — Install templates, integrations, and workflows

## Contributing

```bash
git clone https://github.com/GitHat-IO/create-githat-app.git
cd create-githat-app
npm install
npm run build
node bin/index.js test-app
```

## Related

- [@githat/nextjs](https://www.npmjs.com/package/@githat/nextjs) — React/Next.js SDK
- [GitHat Platform](https://githat.io) — Auth + Hosting replacing Clerk + Vercel
- [GitHat Pricing](https://githat.io/pricing) — Free, Pro, and Enterprise tiers
- [GitHat vs Clerk](https://githat.io/compare/githat-vs-clerk) — Feature comparison
- [GitHat vs Auth0](https://githat.io/compare/githat-vs-auth0) — Why developers switch

## License

Proprietary — see [LICENSE](LICENSE)
