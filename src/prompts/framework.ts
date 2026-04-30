import * as p from '@clack/prompts';
import { detectPackageManager, type PackageManager } from '../utils/package-manager.js';

export interface FrameworkAnswers {
  framework: 'nextjs' | 'react-vite' | 'plain';
  typescript: boolean;
  packageManager: PackageManager;
}

export async function promptFramework(typescriptOverride?: boolean, isFullstack?: boolean): Promise<FrameworkAnswers> {
  const packageManager = detectPackageManager();

  // Different developers want different starting points. "plain" is the
  // smallest possible scaffold — auth pages + a homepage, nothing else.
  // It's the right pick for someone who just wants GitHat dropped into
  // an idea and hasn't decided what the app actually is yet.
  // React+Vite remains frontend-only (no fullstack template exists).
  const frameworkOptions = isFullstack
    ? [{ value: 'nextjs', label: 'Next.js 16', hint: 'App Router · SSR · middleware auth' }]
    : [
        { value: 'plain', label: 'Plain (recommended for first time)', hint: 'Just auth + one homepage. Build whatever on top.' },
        { value: 'nextjs', label: 'Next.js 16 — full kit', hint: 'Dashboard · orgs · agents · MCP scaffolding' },
        { value: 'react-vite', label: 'React 19 + Vite 7', hint: 'SPA · client-side routing' },
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
