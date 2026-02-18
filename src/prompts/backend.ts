import * as p from '@clack/prompts';
import type { BackendFramework } from '../constants.js';

export interface BackendAnswers {
  backendFramework: BackendFramework;
}

export async function promptBackend(): Promise<BackendAnswers> {
  const answers = await p.group(
    {
      backendFramework: () =>
        p.select({
          message: 'Backend framework',
          options: [
            {
              value: 'hono',
              label: 'Hono',
              hint: 'recommended · serverless-native · 14KB',
            },
            {
              value: 'express',
              label: 'Express',
              hint: 'classic Node.js · large ecosystem',
            },
            {
              value: 'fastify',
              label: 'Fastify',
              hint: 'high performance · schema validation',
            },
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
    backendFramework: answers.backendFramework as BackendFramework,
  };
}
