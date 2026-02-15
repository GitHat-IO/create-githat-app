import * as p from '@clack/prompts';

export type DatabaseChoice =
  | 'none'
  | 'prisma-postgres'
  | 'prisma-mysql'
  | 'drizzle-postgres'
  | 'drizzle-sqlite';

export interface FeatureAnswers {
  databaseChoice: DatabaseChoice;
  useTailwind: boolean;
  includeDashboard: boolean;
  includeGithatFolder: boolean;
}

export async function promptFeatures(): Promise<FeatureAnswers> {
  const answers = await p.group(
    {
      databaseChoice: () =>
        p.select({
          message: 'Database',
          options: [
            { value: 'none', label: 'None', hint: 'use GitHat backend directly' },
            { value: 'prisma-postgres', label: 'Prisma + PostgreSQL' },
            { value: 'prisma-mysql', label: 'Prisma + MySQL' },
            { value: 'drizzle-postgres', label: 'Drizzle + PostgreSQL' },
            { value: 'drizzle-sqlite', label: 'Drizzle + SQLite' },
          ],
        }),
      useTailwind: () =>
        p.confirm({ message: 'Tailwind CSS?', initialValue: true }),
      includeDashboard: () =>
        p.confirm({ message: 'Include dashboard?', initialValue: true }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.');
        process.exit(0);
      },
    },
  );

  return {
    databaseChoice: answers.databaseChoice as DatabaseChoice,
    useTailwind: answers.useTailwind as boolean,
    includeDashboard: answers.includeDashboard as boolean,
    includeGithatFolder: true,
  };
}
