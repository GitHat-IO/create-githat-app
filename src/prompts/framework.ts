import * as p from '@clack/prompts';
import { detectPackageManager, type PackageManager } from '../utils/package-manager.js';

export interface FrameworkAnswers {
  framework: 'nextjs' | 'react-vite' | 'plain' | 'saas' | 'marketplace' | 'agent' | 'content' | 'dashboard';
  typescript: boolean;
  packageManager: PackageManager;
}

export async function promptFramework(typescriptOverride?: boolean, isFullstack?: boolean): Promise<FrameworkAnswers> {
  const packageManager = detectPackageManager();

  // Vercel-style template gallery. Six concrete starting points so a
  // developer immediately sees "what could I build on GitHat?"
  // See ../../TEMPLATES.md for the full lineup and what each
  // template demonstrates.
  // React+Vite stays frontend-only (no fullstack template exists).
  const frameworkOptions = isFullstack
    ? [{ value: 'nextjs', label: 'Next.js 16', hint: 'App Router · SSR · middleware auth' }]
    : [
        { value: 'plain',       label: 'Plain',       hint: 'Auth + a homepage. Smallest possible GitHat app.' },
        { value: 'saas',        label: 'SaaS',        hint: 'Orgs, teams, RBAC, subscription billing. Replaces Clerk + Stripe.' },
        { value: 'marketplace', label: 'Marketplace', hint: 'Multi-vendor commerce. Anonymous-first browsing, Sebastn Connect.' },
        { value: 'agent',       label: 'AI Agent',    hint: 'Web4 wallet-bound agent + MCP server. Public verification.' },
        { value: 'content',     label: 'Content',     hint: 'Paywalled posts, newsletter, one-time purchases. Replaces Substack.' },
        { value: 'dashboard',   label: 'Dashboard',   hint: 'Auth-gated admin UI over your existing database.' },
        { value: 'nextjs',      label: 'Next.js (full kit)', hint: 'Legacy: dashboard + orgs + agents + MCP scaffolding.' },
        { value: 'react-vite',  label: 'React + Vite', hint: 'SPA · client-side routing.' },
      ];

  const answers = await p.group(
    {
      framework: () =>
        p.select({
          message: 'Framework',
          options: frameworkOptions,
        }),
      typescript: () =>
        typescriptOverride !== undefined
          ? Promise.resolve(typescriptOverride)
          : p.select({
              message: 'Language',
              options: [
                { value: true, label: 'TypeScript', hint: 'recommended' },
                { value: false, label: 'JavaScript' },
              ],
            }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.');
        process.exit(0);
      },
    },
  );

  return {
    framework: answers.framework as 'nextjs' | 'react-vite',
    typescript: answers.typescript as boolean,
    packageManager,
  };
}
