import * as p from '@clack/prompts';
import { validateProjectName } from '../utils/validate.js';

export interface ProjectAnswers {
  projectName: string;
  businessName: string;
  description: string;
}

export async function promptProject(initialName?: string): Promise<ProjectAnswers> {
  const answers = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'Project name',
          placeholder: 'my-githat-app',
          initialValue: initialName || '',
          validate: validateProjectName,
        }),
      businessName: () =>
        p.text({
          message: 'Business or app display name',
          placeholder: 'Acme Corp',
          validate: (v) => (!v ? 'Display name is required' : undefined),
        }),
      description: () =>
        p.text({
          message: 'One-line description',
          placeholder: 'A platform for managing identity across humans and AI',
          initialValue: '',
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
    projectName: answers.projectName as string,
    businessName: answers.businessName as string,
    description: (answers.description as string) || `${answers.businessName} — Built with GitHat identity`,
  };
}
