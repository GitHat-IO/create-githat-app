import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { displayBanner } from './utils/ascii.js';
import { runPrompts, answersToContext } from './prompts/index.js';
import { scaffold } from './scaffold/index.js';
import { VERSION } from './constants.js';
import { skillsCommand } from './commands/skills/index.js';

const program = new Command();

program
  .name('githat')
  .description('GitHat CLI - Scaffold apps and manage skills')
  .version(VERSION);

// Default create command (backwards compatible with create-githat-app)
program
  .command('create [project-name]', { isDefault: true })
  .description('Scaffold a new GitHat app')
  .option('--key <key>', 'GitHat publishable key (pk_live_...)')
  .option('--ts', 'Use TypeScript (default)')
  .option('--js', 'Use JavaScript')
  .option('--fullstack', 'Create fullstack project (Turborepo)')
  .option('--backend <framework>', 'Backend framework (hono, express, fastify)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .action(async (projectName: string | undefined, opts: { key?: string; ts?: boolean; js?: boolean; fullstack?: boolean; backend?: string; yes?: boolean }) => {
    try {
      displayBanner();

      const typescript = opts.js ? false : opts.ts ? true : undefined;

      // --yes flag requires project name
      if (opts.yes && !projectName) {
        p.cancel(chalk.red('Project name is required when using --yes flag'));
        process.exit(1);
      }

      const answers = await runPrompts({
        initialName: projectName,
        publishableKey: opts.key,
        typescript,
        yes: opts.yes,
        fullstack: opts.fullstack,
        backendFramework: opts.backend as 'hono' | 'express' | 'fastify' | undefined,
      });

      const context = answersToContext(answers);

      await scaffold(context, {
        installDeps: answers.installDeps,
        initGit: answers.initGit,
        skipPrompts: opts.yes,
      });
    } catch (err) {
      p.cancel(chalk.red((err as Error).message || 'Something went wrong.'));
      process.exit(1);
    }
  });

// Skills marketplace commands
program.addCommand(skillsCommand);

program.parse();
