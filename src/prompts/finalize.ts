import * as p from '@clack/prompts';

export interface FinalizeAnswers {
  initGit: boolean;
  installDeps: boolean;
}

export async function promptFinalize(): Promise<FinalizeAnswers> {
  const installDeps = await p.confirm({
    message: 'Install dependencies?',
    initialValue: true,
  });

  if (p.isCancel(installDeps)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  return {
    initGit: true,
    installDeps: installDeps as boolean,
  };
}
