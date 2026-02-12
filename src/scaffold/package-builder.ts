import type { TemplateContext } from '../utils/template-engine.js';
import { DEPS } from '../constants.js';

export function buildPackageJson(ctx: TemplateContext): Record<string, unknown> {
  const isNext = ctx.framework === 'nextjs';

  const deps: Record<string, string> = {
    ...(isNext ? DEPS.nextjs.dependencies : DEPS['react-vite'].dependencies),
  };

  const devDeps: Record<string, string> = {
    ...(isNext ? DEPS.nextjs.devDependencies : DEPS['react-vite'].devDependencies),
  };

  // Tailwind
  if (ctx.useTailwind) {
    if (isNext) {
      Object.assign(devDeps, DEPS.tailwind.devDependencies);
    } else {
      Object.assign(devDeps, DEPS['tailwind-vite'].devDependencies);
    }
  }

  // Database
  if (ctx.useDatabase && ctx.databaseChoice !== 'none') {
    const dbDeps = DEPS[ctx.databaseChoice as keyof typeof DEPS];
    if (dbDeps && 'dependencies' in dbDeps) {
      Object.assign(deps, dbDeps.dependencies);
    }
    if (dbDeps && 'devDependencies' in dbDeps) {
      Object.assign(devDeps, dbDeps.devDependencies);
    }
  }

  // Remove TS deps if not using TypeScript
  if (!ctx.typescript) {
    delete devDeps.typescript;
    delete devDeps['@types/react'];
    delete devDeps['@types/react-dom'];
    delete devDeps['@types/node'];
    delete devDeps['@types/better-sqlite3'];
  }

  const scripts: Record<string, string> = isNext
    ? { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' }
    : { dev: 'vite', build: 'vite build', preview: 'vite preview' };

  // Add DB scripts
  if (ctx.databaseChoice.startsWith('prisma')) {
    scripts['db:push'] = 'prisma db push';
    scripts['db:studio'] = 'prisma studio';
    scripts['db:generate'] = 'prisma generate';
  } else if (ctx.databaseChoice.startsWith('drizzle')) {
    scripts['db:push'] = 'drizzle-kit push';
    scripts['db:generate'] = 'drizzle-kit generate';
    scripts['db:migrate'] = 'drizzle-kit migrate';
  }

  return {
    name: ctx.projectName,
    version: '0.1.0',
    private: true,
    ...(isNext ? {} : { type: 'module' }),
    scripts,
    dependencies: sortKeys(deps),
    devDependencies: sortKeys(devDeps),
  };
}

function sortKeys(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}
