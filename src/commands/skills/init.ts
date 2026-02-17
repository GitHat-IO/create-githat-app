import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as p from '@clack/prompts';

const SKILL_TYPES = ['template', 'integration', 'ui', 'ai', 'workflow'] as const;
type SkillType = typeof SKILL_TYPES[number];

interface SkillManifest {
  name: string;
  version: string;
  description: string;
  type: SkillType;
  author: {
    name: string;
    email: string;
  };
  repository?: string;
  license: string;
  requires: {
    env: string[];
    tier?: string;
  };
  files: Record<string, string | string[]>;
  install: {
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
    envExample: Record<string, string>;
  };
  keywords: string[];
}

function generateReadme(manifest: SkillManifest): string {
  return `# ${manifest.name}

${manifest.description}

## Installation

\`\`\`bash
githat skills install ${manifest.name}
\`\`\`

## Requirements

${manifest.requires.env.length > 0 ? `
### Environment Variables

${manifest.requires.env.map((e) => `- \`${e}\``).join('\n')}
` : ''}
${manifest.requires.tier ? `
### Minimum Tier

This skill requires **${manifest.requires.tier}** tier or higher.
` : ''}

## Usage

\`\`\`typescript
// Import from the installed skill
import { /* exports */ } from './githat/skills/${manifest.name}';

// Use the skill
// ...
\`\`\`

## License

${manifest.license}
`;
}

function generateIndexFile(manifest: SkillManifest): string {
  const typeExports: Record<SkillType, string> = {
    template: `// Template skill - provides project scaffolding
export const templateName = '${manifest.name}';
export const templateVersion = '${manifest.version}';

// Add your template exports here
`,
    integration: `// Integration skill - connects to external services
// Replace with your actual integration code

export interface ${toPascalCase(manifest.name)}Config {
  apiKey: string;
  // Add configuration options
}

export function create${toPascalCase(manifest.name)}(config: ${toPascalCase(manifest.name)}Config) {
  // Initialize your integration
  return {
    // Return your integration client/functions
  };
}
`,
    ui: `// UI skill - provides React components
import React from 'react';

export interface ${toPascalCase(manifest.name)}Props {
  // Add component props
}

export function ${toPascalCase(manifest.name)}({ ...props }: ${toPascalCase(manifest.name)}Props) {
  return (
    <div>
      {/* Your component */}
    </div>
  );
}
`,
    ai: `// AI skill - MCP server / Claude tools
export interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export const tools: Tool[] = [
  {
    name: '${manifest.name.replace(/-/g, '_')}',
    description: '${manifest.description}',
    inputSchema: {
      type: 'object',
      properties: {
        // Add input properties
      },
    },
  },
];

export async function handleTool(name: string, input: Record<string, unknown>) {
  // Handle tool invocations
}
`,
    workflow: `// Workflow skill - automation recipes
export interface WorkflowTrigger {
  event: string;
  condition?: string;
}

export interface WorkflowStep {
  id: string;
  run?: string;
  action?: string;
}

export const triggers: WorkflowTrigger[] = [
  { event: 'deploy.success' },
];

export const steps: WorkflowStep[] = [
  { id: 'notify', run: 'echo "Workflow executed"' },
];
`,
  };

  return typeExports[manifest.type];
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export const initCommand = new Command('init')
  .description('Initialize a new skill package')
  .argument('<name>', 'Skill name (slug format: lowercase-with-hyphens)')
  .option('-t, --type <type>', 'Skill type (template, integration, ui, ai, workflow)')
  .option('-d, --dir <dir>', 'Parent directory (default: current directory)')
  .action(async (name: string, options: { type?: string; dir?: string }) => {
    try {
      // Validate name
      if (!/^[a-z][a-z0-9-]{1,62}[a-z0-9]$/.test(name)) {
        console.error(chalk.red('Error: Name must be lowercase alphanumeric with hyphens (2-64 chars, start with letter)'));
        process.exit(1);
      }

      const parentDir = options.dir ? path.resolve(options.dir) : process.cwd();
      const skillDir = path.join(parentDir, name);

      if (fs.existsSync(skillDir)) {
        console.error(chalk.red(`Error: Directory "${name}" already exists`));
        process.exit(1);
      }

      console.log(chalk.cyan(`\n📦 Initializing skill: ${name}\n`));

      // Get skill type
      let type: SkillType;
      if (options.type && SKILL_TYPES.includes(options.type as SkillType)) {
        type = options.type as SkillType;
      } else {
        const result = await p.select({
          message: 'What type of skill are you creating?',
          options: [
            { value: 'integration', label: 'Integration', hint: 'Connect to external services (Stripe, SendGrid, etc.)' },
            { value: 'template', label: 'Template', hint: 'Full project scaffolding' },
            { value: 'ui', label: 'UI Pack', hint: 'Reusable React components' },
            { value: 'ai', label: 'AI Skill', hint: 'MCP server / Claude tools' },
            { value: 'workflow', label: 'Workflow', hint: 'Automation recipes' },
          ],
        });

        if (p.isCancel(result)) {
          p.cancel('Operation cancelled');
          process.exit(0);
        }

        type = result as SkillType;
      }

      // Get description
      const description = await p.text({
        message: 'Short description:',
        placeholder: `A ${type} skill for...`,
        validate: (v) => (v.length < 10 ? 'Description must be at least 10 characters' : undefined),
      });

      if (p.isCancel(description)) {
        p.cancel('Operation cancelled');
        process.exit(0);
      }

      // Create manifest
      const manifest: SkillManifest = {
        name,
        version: '1.0.0',
        description: description as string,
        type,
        author: {
          name: 'Your Name',
          email: 'your@email.com',
        },
        license: 'MIT',
        requires: {
          env: [],
        },
        files: {
          lib: 'src/index.ts',
        },
        install: {
          dependencies: {},
          envExample: {},
        },
        keywords: [type],
      };

      // Create directory structure
      fs.mkdirSync(skillDir, { recursive: true });
      fs.mkdirSync(path.join(skillDir, 'src'), { recursive: true });

      // Write files
      fs.writeFileSync(
        path.join(skillDir, 'githat-skill.json'),
        JSON.stringify(manifest, null, 2)
      );

      fs.writeFileSync(
        path.join(skillDir, 'README.md'),
        generateReadme(manifest)
      );

      fs.writeFileSync(
        path.join(skillDir, 'src', 'index.ts'),
        generateIndexFile(manifest)
      );

      // Create .gitignore
      fs.writeFileSync(
        path.join(skillDir, '.gitignore'),
        `node_modules/
dist/
.env
.env.local
*.log
`
      );

      console.log(chalk.green(`\n✅ Created skill at ${skillDir}\n`));

      console.log(chalk.dim('Files created:'));
      console.log(chalk.dim(`  githat-skill.json  - Skill manifest`));
      console.log(chalk.dim(`  README.md          - Documentation`));
      console.log(chalk.dim(`  src/index.ts       - Main entry point`));
      console.log(chalk.dim(`  .gitignore         - Git ignore rules`));

      console.log(chalk.dim('\nNext steps:'));
      console.log(chalk.dim(`  1. cd ${name}`));
      console.log(chalk.dim(`  2. Edit githat-skill.json with your details`));
      console.log(chalk.dim(`  3. Implement your skill in src/index.ts`));
      console.log(chalk.dim(`  4. Publish: githat skills publish .`));
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });
