# create-githat-app

Scaffold enterprise-grade apps with [GitHat](https://githat.io) identity — for humans, AI agents, and MCP servers.

## Quick Start

```bash
npx create-githat-app my-app
```

That's it. The CLI walks you through everything.

## What You Choose

- **Framework** — Next.js 16 (App Router) or React 19 + Vite 7
- **Language** — TypeScript or JavaScript
- **Auth features** — sign-in/up, forgot password, email verification, org management, MCP servers, AI agents
- **Database** — None, Prisma + Postgres/MySQL, or Drizzle + Postgres/SQLite
- **Styling** — Tailwind CSS 4 (optional)
- **Business name** — baked into all generated UI

## What You Get

- Pre-configured `@githat/nextjs` SDK with `<GitHatProvider>`
- Sign-in, sign-up, forgot password, and email verification pages
- Protected dashboard with sidebar, `<UserButton>`, `<OrgSwitcher>`
- `githat/` platform folder — typed API client, auth guards, dashboard modules
- MCP server and AI agent management pages (optional)
- Dark theme out of the box

## The `githat/` Folder

Your generated project includes a `githat/` directory — a local integration layer between your app and the GitHat platform:

```
githat/
  config.ts          # Central configuration
  api/
    client.ts        # Typed fetch wrapper for api.githat.io
    types.ts         # TypeScript types for all API responses
    auth.ts          # Auth endpoint helpers
    orgs.ts          # Organization management
    mcp.ts           # MCP server registration
    agents.ts        # AI agent wallet auth
  auth/
    guard.tsx         # Role-based route protection
  dashboard/
    layout.tsx        # Dashboard shell with sidebar
    overview.tsx      # Stats overview
    apps.tsx          # App + API key management
    members.tsx       # Org member management
    settings.tsx      # Org settings
```

## CLI Options

```bash
npx create-githat-app my-app --key pk_live_abc123
npx create-githat-app my-app --js
```

## Development

```bash
git clone https://github.com/GitHat-IO/create-githat-app.git
cd create-githat-app
npm install
npm run build
node bin/index.js test-app
```

## License

MIT
