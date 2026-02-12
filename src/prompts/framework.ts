import * as p from '@clack/prompts';
import { detectPackageManager, isAvailable, type PackageManager } from '../utils/package-manager.js';

export interface FrameworkAnswers {
  framework: 'nextjs' | 'react-vite';
  typescript: boolean;
  packageManager: PackageManager;
}

export async function promptFramework(typescriptOverride?: boolean): Promise<FrameworkAnswers> {
  const detected = detectPackageManager();

  const answers = await p.group(
    {
      framework: () =>
        p.select({
          message: 'Framework',
          options: [
            { value: 'nextjs', label: 'Next.js 16', hint: 'App Router, SSR, middleware auth' },
            { value: 'react-vite', label: 'React 19 + Vite 7', hint: 'SPA, client-side routing' },
          ],
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
      packageManager: () =>
        p.select({
          message: 'Package manager',
          initialValue: detected,
          options: (['npm', 'pnpm', 'yarn', 'bun'] as const)
            .filter((pm) => pm === detected || isAvailable(pm))
            .map((pm) => ({
              value: pm,
              label: pm,
              hint: pm === detected ? 'detected' : undefined,
            })),
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
    packageManager: answers.packageManager as PackageManager,
  };
}
