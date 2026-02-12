import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { displayBanner } from './utils/ascii.js';
import { runPrompts, answersToContext } from './prompts/index.js';
import { scaffold } from './scaffold/index.js';
import { VERSION } from './constants.js';

const program = new Command();

program
  .name('create-githat-app')
  .description('Scaffold enterprise-grade apps with GitHat identity')
  .version(VERSION)
  .argument('[project-name]', 'Name of the project directory')
  .option('--key <key>', 'GitHat publishable key (pk_live_...)')
  .option('--ts', 'Use TypeScript (default)')
  .option('--js', 'Use JavaScript')
  .action(async (projectName: string | undefined, opts: { key?: string; ts?: boolean; js?: boolean }) => {
    try {
      displayBanner();

      const typescript = opts.js ? false : opts.ts ? true : undefined;

      const answers = await runPrompts({
        initialName: projectName,
        publishableKey: opts.key,
        typescript,
      });

      const context = answersToContext(answers);

      await scaffold(context, {
        installDeps: answers.installDeps,
        initGit: answers.initGit,
      });
    } catch (err) {
      p.cancel(chalk.red((err as Error).message || 'Something went wrong.'));
      process.exit(1);
    }
  });

program.parse();
