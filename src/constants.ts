export const VERSION = '0.5.1';
export const DEFAULT_API_URL = 'https://api.githat.io';
export const DOCS_URL = 'https://githat.io/docs/sdk';
export const DASHBOARD_URL = 'https://githat.io/dashboard/apps';

export const BRAND_COLORS = ['#7c3aed', '#6366f1', '#8b5cf6'] as const;

export const DEPS = {
  nextjs: {
    dependencies: {
      next: '^16.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      '@githat/nextjs': '^0.5.0',
    },
    devDependencies: {
      typescript: '^5.9.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@types/node': '^22.0.0',
    },
  },
  'react-vite': {
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'react-router-dom': '^7.0.0',
      '@githat/nextjs': '^0.5.0',
    },
    devDependencies: {
      vite: '^7.0.0',
      '@vitejs/plugin-react': '^4.4.0',
      typescript: '^5.9.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
    },
  },
  tailwind: {
    devDependencies: {
      tailwindcss: '^4.0.0',
      '@tailwindcss/postcss': '^4.0.0',
      postcss: '^8.4.0',
    },
  },
  'tailwind-vite': {
    devDependencies: {
      tailwindcss: '^4.0.0',
      '@tailwindcss/vite': '^4.0.0',
    },
  },
  'prisma-postgres': {
    dependencies: { '@prisma/client': '^6.4.0' },
    devDependencies: { prisma: '^6.4.0' },
  },
  'prisma-mysql': {
    dependencies: { '@prisma/client': '^6.4.0' },
    devDependencies: { prisma: '^6.4.0' },
  },
  'drizzle-postgres': {
    dependencies: { 'drizzle-orm': '^0.39.0', postgres: '^3.4.0' },
    devDependencies: { 'drizzle-kit': '^0.30.0' },
  },
  'drizzle-sqlite': {
    dependencies: { 'drizzle-orm': '^0.39.0', 'better-sqlite3': '^11.0.0' },
    devDependencies: { 'drizzle-kit': '^0.30.0', '@types/better-sqlite3': '^7.6.0' },
  },
} as const;
