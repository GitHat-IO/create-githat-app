import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

interface LockEntry {
  version: string;
  installedAt: string;
}

export const installedCommand = new Command('installed')
  .alias('ls')
  .description('List installed skills in current project')
  .option('-d, --dir <dir>', 'Project directory (default: current directory)')
  .action(async (options: { dir?: string }) => {
    try {
      const projectDir = options.dir ? path.resolve(options.dir) : process.cwd();
      const lockPath = path.join(projectDir, 'githat.lock');

      if (!fs.existsSync(lockPath)) {
        console.log(chalk.yellow('\nNo skills installed in this project.'));
        console.log(chalk.dim('\nTo install a skill:'));
        console.log(chalk.dim('  githat skills install <slug>'));
        return;
      }

      let lock: Record<string, LockEntry>;
      try {
        lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      } catch {
        console.error(chalk.red('Error: Invalid githat.lock file'));
        process.exit(1);
      }

      const entries = Object.entries(lock);

      if (entries.length === 0) {
        console.log(chalk.yellow('\nNo skills installed in this project.'));
        return;
      }

      console.log(chalk.cyan(`\n📦 Installed skills (${entries.length}):\n`));

      // Header
      console.log(chalk.dim(`${'SKILL'.padEnd(30)} ${'VERSION'.padEnd(12)} INSTALLED`));
      console.log(chalk.dim('─'.repeat(60)));

      for (const [slug, entry] of entries) {
        const date = new Date(entry.installedAt).toLocaleDateString();
        console.log(`${chalk.bold(slug.padEnd(30))} ${entry.version.padEnd(12)} ${chalk.dim(date)}`);
      }

      console.log(chalk.dim('─'.repeat(60)));

      console.log(chalk.dim('\nTo update a skill:'));
      console.log(chalk.dim('  githat skills install <slug> --version <new-version>'));
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });
