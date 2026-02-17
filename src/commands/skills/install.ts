import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream, mkdirSync } from 'fs';
import { createGunzip } from 'zlib';
import { Extract } from 'unzipper';
import { getSkill, getDownloadUrl } from './api.js';

async function downloadAndExtract(url: string, destDir: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  // Create temp file
  const tempZip = path.join(destDir, '.skill-download.zip');
  const fileStream = createWriteStream(tempZip);

  // Download to temp file
  await pipeline(response.body as any, fileStream);

  // Extract zip
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(tempZip)
      .pipe(Extract({ path: destDir }))
      .on('close', resolve)
      .on('error', reject);
  });

  // Clean up temp file
  fs.unlinkSync(tempZip);
}

function updateGithatLock(projectDir: string, skill: { slug: string; version: string }) {
  const lockPath = path.join(projectDir, 'githat.lock');
  let lock: Record<string, { version: string; installedAt: string }> = {};

  if (fs.existsSync(lockPath)) {
    try {
      lock = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    } catch {
      // Invalid lock file, start fresh
    }
  }

  lock[skill.slug] = {
    version: skill.version,
    installedAt: new Date().toISOString(),
  };

  fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
}

function updateEnvExample(projectDir: string, manifest: { requires?: { env?: string[] } }) {
  if (!manifest.requires?.env?.length) return;

  const envPath = path.join(projectDir, '.env.local');
  const envExamplePath = path.join(projectDir, '.env.example');

  // Read existing env files
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
  }

  // Add missing env vars
  const existingVars = new Set(
    envContent.split('\n')
      .filter(line => line.includes('='))
      .map(line => line.split('=')[0].trim())
  );

  const newVars: string[] = [];
  for (const envVar of manifest.requires.env) {
    if (!existingVars.has(envVar)) {
      newVars.push(`${envVar}=`);
    }
  }

  if (newVars.length > 0) {
    const addition = `\n# Added by skill install\n${newVars.join('\n')}\n`;
    if (fs.existsSync(envPath)) {
      fs.appendFileSync(envPath, addition);
    } else {
      fs.writeFileSync(envPath, `# Environment variables\n${newVars.join('\n')}\n`);
    }
  }
}

export const installCommand = new Command('install')
  .description('Install a skill to your project')
  .argument('<slug>', 'Skill slug (e.g., stripe-billing)')
  .option('-v, --version <version>', 'Specific version to install')
  .option('-d, --dir <dir>', 'Project directory (default: current directory)')
  .action(async (slug: string, options: { version?: string; dir?: string }) => {
    try {
      const projectDir = options.dir ? path.resolve(options.dir) : process.cwd();

      // Check if in a githat project
      const packageJsonPath = path.join(projectDir, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        console.error(chalk.red('Error: No package.json found. Are you in a project directory?'));
        process.exit(1);
      }

      console.log(chalk.dim(`\nFetching skill info for "${slug}"...\n`));

      // Get skill info
      const skill = await getSkill(slug);
      console.log(chalk.cyan(`📦 ${skill.name}`));
      console.log(chalk.dim(`   ${skill.description}`));
      console.log(chalk.dim(`   Type: ${skill.type} · Author: ${skill.authorName}\n`));

      // Get download URL
      const download = await getDownloadUrl(slug, options.version);
      const version = download.version.version;

      console.log(chalk.dim(`Downloading ${skill.name}@${version}...`));

      // Create skill directory
      const skillDir = path.join(projectDir, 'githat', 'skills', slug);
      mkdirSync(skillDir, { recursive: true });

      // Download and extract
      await downloadAndExtract(download.downloadUrl, skillDir);

      console.log(chalk.green(`✓ Downloaded to ${path.relative(projectDir, skillDir)}`));

      // Read manifest if available
      const manifestPath = path.join(skillDir, 'githat-skill.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

        // Update .env with required vars
        updateEnvExample(projectDir, manifest);

        // Show required env vars
        if (manifest.requires?.env?.length) {
          console.log(chalk.yellow(`\n⚠ Required environment variables:`));
          for (const envVar of manifest.requires.env) {
            console.log(chalk.dim(`   ${envVar}`));
          }
          console.log(chalk.dim(`\n   Add these to your .env.local file`));
        }

        // Show dependencies to install
        if (manifest.install?.dependencies) {
          const deps = Object.entries(manifest.install.dependencies)
            .map(([name, ver]) => `${name}@${ver}`)
            .join(' ');
          console.log(chalk.yellow(`\n⚠ Install npm dependencies:`));
          console.log(chalk.dim(`   npm install ${deps}`));
        }
      }

      // Update lock file
      updateGithatLock(projectDir, { slug, version });

      console.log(chalk.green(`\n✅ Successfully installed ${skill.name}@${version}\n`));

      console.log(chalk.dim('Next steps:'));
      console.log(chalk.dim(`  1. Check githat/skills/${slug}/README.md for usage`));
      console.log(chalk.dim('  2. Add required environment variables to .env.local'));
      console.log(chalk.dim('  3. Import and use the skill in your code'));
    } catch (err) {
      console.error(chalk.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  });
