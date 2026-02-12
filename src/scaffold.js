const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nextjsTemplates = require('./templates');
const reactTemplates = require('./templates/react');

// ANSI helpers
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', cyan: '\x1b[36m', magenta: '\x1b[35m', red: '\x1b[31m',
};

const ok = (msg) => console.log(`  ${c.green}✓${c.reset} ${msg}`);
const info = (msg) => console.log(`  ${c.cyan}◐${c.reset} ${msg}`);

async function scaffold(options) {
  const { projectName, framework, typescript, packageManager, publishableKey, includeDashboard } = options;
  const root = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(root)) {
    console.error(`\n  ${c.red}✗${c.reset} Directory "${projectName}" already exists.\n`);
    process.exit(1);
  }

  console.log();
  fs.mkdirSync(root, { recursive: true });

  if (framework === 'react') {
    scaffoldReact(root, options);
  } else {
    scaffoldNextjs(root, options);
  }

  // Install dependencies
  const installCmd = { npm: 'npm install', pnpm: 'pnpm install', yarn: 'yarn' }[packageManager] || 'npm install';
  info(`Installing dependencies with ${packageManager}...`);
  try {
    execSync(installCmd, { cwd: root, stdio: 'ignore' });
    ok('Installed dependencies');
  } catch {
    console.log(`  ${c.red}⚠${c.reset}  Could not auto-install. Run ${c.cyan}${installCmd}${c.reset} manually.`);
  }

  const devCmd = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
  const port = framework === 'react' ? '5173' : '3000';

  console.log(`
  ${c.magenta}┌─────────────────────────────────────┐${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.green}${c.bold}✓ Ready!${c.reset}                          ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.cyan}cd ${projectName}${c.reset}${pad(25 - projectName.length)}${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.cyan}${devCmd}${c.reset}${pad(33 - devCmd.length)}${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.dim}→ http://localhost:${port}${c.reset}${pad(port.length === 4 ? 8 : 9)}${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.dim}/sign-up${c.reset}    Create account       ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.dim}/sign-in${c.reset}    Sign in              ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.dim}/dashboard${c.reset}  Protected page       ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}   ${c.dim}Docs: https://githat.io/docs/sdk${c.reset}  ${c.magenta}│${c.reset}
  ${c.magenta}│${c.reset}                                     ${c.magenta}│${c.reset}
  ${c.magenta}└─────────────────────────────────────┘${c.reset}
`);
}

function pad(n) { return ' '.repeat(Math.max(0, n)); }

// ─── Next.js (App Router) ────────────────────────────────────────────

function scaffoldNextjs(root, options) {
  const { projectName, typescript, publishableKey, includeDashboard } = options;
  const ext = typescript ? 'tsx' : 'jsx';

  const pkg = {
    name: projectName, version: '0.1.0', private: true,
    scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' },
    dependencies: { next: '^14.0.0', react: '^18.0.0', 'react-dom': '^18.0.0', '@githat/nextjs': '^0.1.0' },
    devDependencies: {},
  };
  if (typescript) {
    Object.assign(pkg.devDependencies, {
      typescript: '^5.0.0', '@types/react': '^18.0.0', '@types/react-dom': '^18.0.0', '@types/node': '^20.0.0',
    });
  }
  writeFile(root, 'package.json', JSON.stringify(pkg, null, 2));

  writeFile(root, 'next.config.mjs',
    `/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nexport default nextConfig;\n`);

  if (typescript) {
    writeFile(root, 'tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: 'ES2017', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true,
        strict: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler',
        resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true,
        plugins: [{ name: 'next' }], paths: { '@/*': ['./*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }, null, 2));
  }

  writeFile(root, '.env.local', `NEXT_PUBLIC_GITHAT_PUBLISHABLE_KEY=${publishableKey}\n`);
  writeFile(root, '.gitignore', 'node_modules\n.next\n.env*.local\nout\n');
  writeFile(root, `middleware.${typescript ? 'ts' : 'js'}`, nextjsTemplates.middleware());

  fs.mkdirSync(path.join(root, 'app'), { recursive: true });
  writeFile(root, `app/layout.${ext}`, nextjsTemplates.layout(typescript));
  writeFile(root, `app/page.${ext}`, nextjsTemplates.page());
  writeFile(root, 'app/globals.css', nextjsTemplates.globalsCss());
  ok('Created project structure');

  fs.mkdirSync(path.join(root, 'app', '(auth)', 'sign-in'), { recursive: true });
  fs.mkdirSync(path.join(root, 'app', '(auth)', 'sign-up'), { recursive: true });
  writeFile(root, `app/(auth)/sign-in/page.${ext}`, nextjsTemplates.signInPage());
  writeFile(root, `app/(auth)/sign-up/page.${ext}`, nextjsTemplates.signUpPage());
  ok('Generated auth pages (sign-in, sign-up)');

  if (includeDashboard) {
    fs.mkdirSync(path.join(root, 'app', 'dashboard'), { recursive: true });
    writeFile(root, `app/dashboard/layout.${ext}`, nextjsTemplates.dashboardLayout());
    writeFile(root, `app/dashboard/page.${ext}`, nextjsTemplates.dashboardPage());
    ok('Added protected dashboard');
  }

  ok('Configured middleware');
}

// ─── React (Vite) ────────────────────────────────────────────────────

function scaffoldReact(root, options) {
  const { projectName, typescript, publishableKey, includeDashboard } = options;
  const ext = typescript ? 'tsx' : 'jsx';

  const pkg = {
    name: projectName, version: '0.1.0', private: true, type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: {
      react: '^18.0.0', 'react-dom': '^18.0.0', 'react-router-dom': '^6.0.0', '@githat/nextjs': '^0.1.0',
    },
    devDependencies: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.0.0' },
  };
  if (typescript) {
    Object.assign(pkg.devDependencies, {
      typescript: '^5.0.0', '@types/react': '^18.0.0', '@types/react-dom': '^18.0.0',
    });
  }
  writeFile(root, 'package.json', JSON.stringify(pkg, null, 2));

  writeFile(root, typescript ? 'vite.config.ts' : 'vite.config.js', reactTemplates.viteConfig());

  if (typescript) {
    writeFile(root, 'tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: 'ES2020', lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext', skipLibCheck: true,
        moduleResolution: 'bundler', allowImportingTsExtensions: true, isolatedModules: true,
        moduleDetection: 'force', noEmit: true, jsx: 'react-jsx', strict: true,
      },
      include: ['src'],
    }, null, 2));
  }

  writeFile(root, '.env', `VITE_GITHAT_PUBLISHABLE_KEY=${publishableKey}\n`);
  writeFile(root, '.gitignore', 'node_modules\ndist\n.env*.local\n');
  writeFile(root, 'index.html', reactTemplates.indexHtml(projectName, typescript));
  ok('Created project structure');

  fs.mkdirSync(path.join(root, 'src', 'pages'), { recursive: true });
  writeFile(root, `src/main.${ext}`, reactTemplates.mainEntry());
  writeFile(root, `src/App.${ext}`, reactTemplates.appRoutes(includeDashboard));
  writeFile(root, 'src/index.css', reactTemplates.indexCss());

  writeFile(root, `src/pages/Home.${ext}`, reactTemplates.homePage());
  writeFile(root, `src/pages/SignIn.${ext}`, reactTemplates.signInPage());
  writeFile(root, `src/pages/SignUp.${ext}`, reactTemplates.signUpPage());
  ok('Generated auth pages (sign-in, sign-up)');

  if (includeDashboard) {
    writeFile(root, `src/pages/Dashboard.${ext}`, reactTemplates.dashboardPage());
    ok('Added protected dashboard');
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function writeFile(root, relativePath, content) {
  const fullPath = path.join(root, relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

module.exports = { scaffold };
