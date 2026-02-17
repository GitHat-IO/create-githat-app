import { Command } from 'commander';
import chalk from 'chalk';
import { searchCommand } from './search.js';
import { listCommand } from './list.js';
import { installCommand } from './install.js';
import { installedCommand } from './installed.js';
import { initCommand } from './init.js';

export const skillsCommand = new Command('skills')
  .description('Manage GitHat skills marketplace')
  .addCommand(searchCommand)
  .addCommand(listCommand)
  .addCommand(installCommand)
  .addCommand(installedCommand)
  .addCommand(initCommand);

// Default action shows help
skillsCommand.action(() => {
  console.log(chalk.cyan('\n📦 GitHat Skills Marketplace\n'));
  console.log('Commands:');
  console.log('  search <query>     Search skills by keyword');
  console.log('  list               List skills (filterable by type)');
  console.log('  install <slug>     Install a skill to your project');
  console.log('  installed          List installed skills');
  console.log('  init <name>        Initialize a new skill package');
  console.log('\nExamples:');
  console.log('  githat skills search stripe');
  console.log('  githat skills list --type=integration');
  console.log('  githat skills install stripe-billing');
  console.log('  githat skills init my-skill --type=integration');
  console.log('');
});
