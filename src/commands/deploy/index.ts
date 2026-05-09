/**
 * `githat deploy` — one-command static deploy for GitHat consumer apps.
 *
 * Reads:
 *   - `.githat/config.json` for { appId, apiUrl }
 *   - `.env.local`         for GITHAT_SECRET_KEY (sk_live_…)
 *   - working directory's `out/` for the static export to ship
 *
 * If `out/` doesn't exist, runs `npm run build` first.
 *
 * Streams a gzipped tar of `out/` to POST {apiUrl}/apps/{appId}/deploy
 * with `Authorization: Bearer ${secretKey}`. The Lambda untars in
 * /tmp, syncs each file to s3://githat-apps-artifacts/apps/<appId>/,
 * invalidates CloudFront, and returns the live URL.
 *
 * No AWS access keys required from the customer — that's the whole
 * point of this command.
 */
import { Command } from 'commander';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { execSync, spawn } from 'child_process';
import { promises as fs, existsSync } from 'fs';
import path from 'path';
import zlib from 'zlib';
import * as tar from 'tar';

interface DeployConfig {
  appId: string;
  apiUrl: string;
  secretKey: string;
}

const DEFAULT_API_URL = 'https://api.githat.io';

async function readConfig(cwd: string): Promise<DeployConfig> {
  // 1. Look for .githat/config.json (canonical)
  const configPath = path.join(cwd, '.githat', 'config.json');
  let appId: string | undefined;
  let apiUrl = DEFAULT_API_URL;

  if (existsSync(configPath)) {
    try {
      const cfg = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      appId = cfg.appId;
      if (cfg.apiUrl) apiUrl = cfg.apiUrl;
    } catch (err) {
      throw new Error(
        `Could not read .githat/config.json: ${(err as Error).message}`
      );
    }
  }

  // 2. Fall back to env vars (CI flow)
  if (!appId) appId = process.env.GITHAT_APP_ID;
  if (process.env.NEXT_PUBLIC_GITHAT_API_URL) apiUrl = process.env.NEXT_PUBLIC_GITHAT_API_URL;

  if (!appId) {
    throw new Error(
      [
        'No appId found. Either:',
        `  - Run ${chalk.cyan('githat init')} to bind this directory to a GitHat app, or`,
        `  - Set ${chalk.cyan('GITHAT_APP_ID')} in your environment, or`,
        `  - Create ${chalk.cyan('.githat/config.json')} with { "appId": "..." }`,
      ].join('\n')
    );
  }

  // 3. Secret key — load from .env.local (the standard pattern), then
  //    fall back to the GITHAT_SECRET_KEY env var.
  let secretKey = process.env.GITHAT_SECRET_KEY || '';
  if (!secretKey) {
    const envPath = path.join(cwd, '.env.local');
    if (existsSync(envPath)) {
      const envText = await fs.readFile(envPath, 'utf-8');
      const m = envText.match(/^GITHAT_SECRET_KEY=(.*)$/m);
      if (m) secretKey = m[1].replace(/^["']|["']$/g, '').trim();
    }
  }

  if (!secretKey || !secretKey.startsWith('sk_live_')) {
    throw new Error(
      [
        'No GITHAT_SECRET_KEY found. Either:',
        `  - Add ${chalk.cyan('GITHAT_SECRET_KEY=sk_live_...')} to ${chalk.cyan('.env.local')}, or`,
        `  - Set the ${chalk.cyan('GITHAT_SECRET_KEY')} env var (CI flow)`,
        '',
        chalk.dim('Get yours at https://githat.io/dashboard/apps → your app → Keys → New secret key'),
      ].join('\n')
    );
  }

  return { appId, apiUrl, secretKey };
}

/**
 * Tar+gzip the contents of `out/` into a Buffer. Files are stored
 * with paths relative to `out/` (no leading directory component) so
 * the Lambda's untar can drop them directly under apps/<appId>/.
 */
async function packArtifact(cwd: string): Promise<Buffer> {
  const outDir = path.join(cwd, 'out');
  if (!existsSync(outDir)) {
    throw new Error(
      `No \`out/\` directory at ${outDir}. Run \`npm run build\` first.`
    );
  }
  const entries = await fs.readdir(outDir);
  if (entries.length === 0) {
    throw new Error('`out/` is empty. Build did not produce any files.');
  }

  // Stream tar → gzip → buffer. tar.create accepts a list of files and
  // streams them through gzip in-process, so the customer doesn't need
  // a system `tar` binary (Windows-friendly).
  const stream = tar.create(
    {
      gzip: true,
      cwd: outDir,
      // 'portable' strips uid/gid/atime/ctime so the bundle hashes
      // identically across machines (helpful if you later add deploy
      // dedup on content hash).
      portable: true,
    },
    entries
  );

  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

interface DeployResponse {
  deploymentId: string;
  filesUploaded: number;
  bytesUploaded: number;
  totalBytes: number;
  cloudfrontInvalidationId: string | null;
  url: string | null;
  status: 'success' | 'failed';
}

async function uploadArtifact(
  cfg: DeployConfig,
  artifact: Buffer,
  commit: string | null,
  commitMessage: string | null
): Promise<DeployResponse> {
  const url = `${cfg.apiUrl.replace(/\/$/, '')}/apps/${cfg.appId}/deploy`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/gzip',
    'Authorization': `Bearer ${cfg.secretKey}`,
  };
  if (commit) headers['X-GitHat-Commit'] = commit;
  if (commitMessage) {
    // HTTP header values can't contain CR/LF. Take the subject line only
    // (first line of the commit message), strip remaining control bytes,
    // and cap at 200 chars.
    const subject = commitMessage.split(/\r?\n/, 1)[0] || '';
    const sanitized = subject.replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, 200);
    if (sanitized) headers['X-GitHat-Commit-Message'] = sanitized;
  }

  const res = await fetch(url, { method: 'POST', headers, body: artifact });
  const text = await res.text();
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    body = { error: text };
  }
  if (!res.ok) {
    throw new Error(
      `Deploy failed (${res.status}): ${body?.error || res.statusText}`
    );
  }
  return body as DeployResponse;
}

function maybeReadGitInfo(cwd: string): { commit: string | null; message: string | null } {
  try {
    const commit = execSync('git rev-parse --short HEAD', {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
    const message = execSync('git log -1 --pretty=%B', {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
    return { commit, message };
  } catch {
    return { commit: null, message: null };
  }
}

async function ensureBuilt(cwd: string, force: boolean): Promise<void> {
  const outDir = path.join(cwd, 'out');
  if (existsSync(outDir) && !force) {
    return;
  }
  const spinner = ora('Building static export (npm run build)...').start();
  await new Promise<void>((resolve, reject) => {
    const child = spawn('npm', ['run', 'build'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Build exited with code ${code}.\n${stderr.slice(-2000)}`));
    });
  });
  spinner.succeed('Build complete');
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export const deployCommand = new Command('deploy')
  .description('Deploy this app to GitHat (no AWS credentials required)')
  .option('--build', 'Force a fresh build even if out/ exists', false)
  .option('--cwd <dir>', 'Run from this directory instead of the current one')
  .action(async (opts: { build?: boolean; cwd?: string }) => {
    const cwd = path.resolve(opts.cwd ?? process.cwd());
    try {
      // Step 1: read config + secret key
      const cfg = await readConfig(cwd);
      p.note(
        [
          `${chalk.dim('app:    ')}${cfg.appId}`,
          `${chalk.dim('api:    ')}${cfg.apiUrl}`,
          `${chalk.dim('cwd:    ')}${cwd}`,
        ].join('\n'),
        'githat deploy'
      );

      // Step 2: build if needed
      await ensureBuilt(cwd, !!opts.build);

      // Step 3: pack
      const packSpin = ora('Packing artifact...').start();
      const artifact = await packArtifact(cwd);
      packSpin.succeed(`Packed ${formatBytes(artifact.length)}`);

      if (artifact.length > 10 * 1024 * 1024) {
        throw new Error(
          `Artifact is ${formatBytes(artifact.length)} — over the 10 MB API limit. ` +
            `Reduce out/ size or wait for the chunked-upload flow.`
        );
      }

      // Step 4: upload
      const upSpin = ora('Uploading to GitHat...').start();
      const git = maybeReadGitInfo(cwd);
      const result = await uploadArtifact(cfg, artifact, git.commit, git.message);
      upSpin.succeed(
        `Uploaded ${result.filesUploaded} files (${formatBytes(result.bytesUploaded)})`
      );

      // Step 5: report
      const lines = [
        chalk.green.bold('🚀 Deployment succeeded'),
        '',
        `${chalk.dim('deployment id:  ')}${result.deploymentId}`,
        `${chalk.dim('cf invalidation:')} ${result.cloudfrontInvalidationId ?? chalk.dim('(none)')}`,
        `${chalk.dim('files:          ')}${result.filesUploaded}`,
        `${chalk.dim('size:           ')}${formatBytes(result.bytesUploaded)}`,
      ];
      if (result.url) {
        lines.push('', `${chalk.cyan('Live at:')} ${result.url}`);
      }
      p.note(lines.join('\n'));
    } catch (err) {
      p.cancel(chalk.red((err as Error).message));
      process.exit(1);
    }
  });
