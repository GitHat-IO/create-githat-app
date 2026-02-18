import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import type { PackageManager } from './package-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate from dist/ -> project root -> templates/
const TEMPLATES_ROOT = path.resolve(__dirname, '..', 'templates');

// Register helpers
Handlebars.registerHelper('ifEquals', function (this: unknown, a: string, b: string, options: Handlebars.HelperOptions) {
  return a === b ? options.fn(this) : options.inverse(this);
});

export interface TemplateContext {
  projectName: string;
  businessName: string;
  description: string;
  framework: 'nextjs' | 'react-vite';
  typescript: boolean;
  packageManager: PackageManager;
  publishableKey: string;
  apiUrl: string;

  // Project type
  projectType: 'frontend' | 'fullstack';
  backendFramework?: 'hono' | 'express' | 'fastify';

  // Feature flags
  useDatabase: boolean;
  databaseChoice: string;
  useTailwind: boolean;
  includeDashboard: boolean;
  includeGithatFolder: boolean;
  includeForgotPassword: boolean;
  includeEmailVerification: boolean;
  includeOrgManagement: boolean;
  includeMcpModule: boolean;
  includeAgentModule: boolean;

  // Derived
  ext: string; // 'tsx' or 'jsx'
  configExt: string; // 'ts' or 'js'
}

export function getTemplatesRoot(): string {
  return TEMPLATES_ROOT;
}

export function renderTemplate(templatePath: string, context: TemplateContext): string {
  const content = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(content, { noEscape: true });
  return template(context);
}

export function renderTemplateDirectory(
  templateDir: string,
  outputDir: string,
  context: TemplateContext,
): void {
  const entries = fs.readdirSync(templateDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(templateDir, entry.name);

    if (entry.isDirectory()) {
      const outDirName = entry.name;
      const outPath = path.join(outputDir, outDirName);
      fs.ensureDirSync(outPath);
      renderTemplateDirectory(srcPath, outPath, context);
    } else if (entry.name.endsWith('.hbs')) {
      // Render handlebars template
      const outputName = entry.name.replace(/\.hbs$/, '');
      // Handle TS/JS extension swapping
      const finalName = context.typescript
        ? outputName
        : outputName.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');
      const outPath = path.join(outputDir, finalName);
      const rendered = renderTemplate(srcPath, context);

      // Skip empty files (conditional templates that render to nothing)
      if (rendered.trim()) {
        fs.ensureDirSync(path.dirname(outPath));
        fs.writeFileSync(outPath, rendered, 'utf-8');
      }
    } else {
      // Copy non-template files as-is
      const outPath = path.join(outputDir, entry.name);
      fs.copySync(srcPath, outPath);
    }
  }
}
