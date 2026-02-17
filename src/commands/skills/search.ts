import { Command } from 'commander';
import chalk from 'chalk';
import { searchSkills, Skill } from './api.js';

function formatSkill(skill: Skill): string {
  const typeColors: Record<string, (s: string) => string> = {
    template: chalk.blue,
    integration: chalk.green,
    ui: chalk.magenta,
    ai: chalk.yellow,
    workflow: chalk.cyan,
  };
  const typeColor = typeColors[skill.type] || chalk.white;

  return [
    `${chalk.bold(skill.name)} ${chalk.dim(`@${skill.latestVersion}`)}`,
    `  ${skill.description}`,
    `  ${typeColor(skill.type)} · ⬇ ${skill.downloads} · ⭐ ${skill.stars} · by ${skill.authorName}`,
    `  ${chalk.dim(`githat skills install ${skill.slug}`)}`,
  ].join('\n');
}

export const searchCommand = new Command('search')
  .description('Search skills by keyword')
  .argument('<query>', 'Search query')
  .option('-t, --type <type>', 'Filter by type (template, integration, ui, ai, workflow)')
  .action(async (query: string, options: { type?: string }) => {
    try {
      console.log(chalk.dim(`\nSearching for "${query}"...\n`));

      const result = await searchSkills(query, options.type);

      if (result.skills.length === 0) {
        console.log(chalk.yellow('No skills found matching your query.'));
        console.log(chalk.dim('\nTry a different search term or browse all skills:'));
        console.log(chalk.dim('  githat skills list'));
        return;
      }

      console.log(chalk.cyan(`Found ${result.skills.length} skill(s):\n`));

      for (const skill of result.skills) {
        console.log(formatSkill(skill));
        console.log('');
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });
