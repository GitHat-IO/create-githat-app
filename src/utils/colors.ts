import chalk from 'chalk';

export const c = {
  brand: chalk.hex('#7c3aed'),
  success: chalk.green,
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
  dim: chalk.dim,
  bold: chalk.bold,
  heading: chalk.bold.hex('#8b5cf6'),
} as const;
