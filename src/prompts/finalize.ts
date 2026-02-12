import * as p from '@clack/prompts';

export interface FinalizeAnswers {
  initGit: boolean;
  installDeps: boolean;
}

export async function promptFinalize(): Promise<FinalizeAnswers> {
  const answers = await p.group(
    {
      initGit: () =>
        p.confirm({ message: 'Initialize git repository?', initialValue: true }),
      installDeps: () =>
        p.confirm({ message: 'Install dependencies now?', initialValue: true }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.');
        process.exit(0);
      },
    },
  );

  return {
    initGit: answers.initGit as boolean,
    installDeps: answers.installDeps as boolean,
  };
}
