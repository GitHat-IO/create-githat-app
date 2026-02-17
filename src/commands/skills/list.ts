import { Command } from 'commander';
import chalk from 'chalk';
import { listSkills, Skill } from './api.js';

function formatSkillCompact(skill: Skill): string {
  const typeColors: Record<string, (s: string) => string> = {
    template: chalk.blue,
    integration: chalk.green,
    ui: chalk.magenta,
    ai: chalk.yellow,
    workflow: chalk.cyan,
  };
  const typeColor = typeColors[skill.type] || chalk.white;

  const name = chalk.bold(skill.name.padEnd(25));
  const type = typeColor(skill.type.padEnd(12));
  const stats = `⬇ ${String(skill.downloads).padStart(5)} ⭐ ${String(skill.stars).padStart(4)}`;
  const desc = skill.description.length > 40
    ? skill.description.substring(0, 37) + '...'
    : skill.description;

  return `${name} ${type} ${stats}  ${chalk.dim(desc)}`;
}

export const listCommand = new Command('list')
  .description('List available skills')
  .option('-t, --type <type>', 'Filter by type (template, integration, ui, ai, workflow)')
  .option('-l, --limit <n>', 'Number of results (default: 25)', '25')
  .action(async (options: { type?: string; limit: string }) => {
    try {
      const limit = parseInt(options.limit, 10);

      console.log(chalk.dim('\nFetching skills...\n'));

      const result = await listSkills({ type: options.type, limit });

      if (result.skills.length === 0) {
        console.log(chalk.yellow('No skills found.'));
        if (options.type) {
          console.log(chalk.dim(`\nTry without the type filter:`));
          console.log(chalk.dim('  githat skills list'));
        }
        return;
      }

      // Header
      const header = `${'NAME'.padEnd(25)} ${'TYPE'.padEnd(12)} ${'DOWNLOADS'.padStart(10)}  DESCRIPTION`;
      console.log(chalk.dim(header));
      console.log(chalk.dim('─'.repeat(80)));

      for (const skill of result.skills) {
        console.log(formatSkillCompact(skill));
      }

      console.log(chalk.dim('─'.repeat(80)));
      console.log(chalk.dim(`Showing ${result.skills.length} skill(s)`));

      if (result.nextCursor) {
        console.log(chalk.dim('\nMore results available. Use --limit to see more.'));
      }

      console.log(chalk.dim('\nTo install: githat skills install <name>'));
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });
