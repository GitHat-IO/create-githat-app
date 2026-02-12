import { execSync } from 'child_process';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || '';
  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('yarn')) return 'yarn';
  if (userAgent.startsWith('bun')) return 'bun';
  return 'npm';
}

export function isAvailable(pm: PackageManager): boolean {
  try {
    execSync(`${pm} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function getInstallCommand(pm: PackageManager): string {
  const cmds: Record<PackageManager, string> = {
    npm: 'npm install',
    pnpm: 'pnpm install',
    yarn: 'yarn',
    bun: 'bun install',
  };
  return cmds[pm];
}

export function getRunCommand(pm: PackageManager, script: string): string {
  if (pm === 'npm') return `npm run ${script}`;
  return `${pm} ${script}`;
}
