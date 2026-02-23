import * as p from '@clack/prompts';
import type { ProjectType } from '../constants.js';

export interface ProjectTypeAnswers {
  projectType: ProjectType;
}

export async function promptProjectType(): Promise<ProjectTypeAnswers> {
  const answers = await p.group(
    {
      projectType: () =>
        p.select({
          message: 'Project type',
          options: [
            {
              value: 'frontend',
              label: 'Frontend only',
              hint: 'Next.js or React+Vite',
            },
            {
              value: 'fullstack',
              label: 'Fullstack',
              hint: 'Next.js + API (Turborepo)',
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
    projectType: answers.projectType as ProjectType,
  };
}
