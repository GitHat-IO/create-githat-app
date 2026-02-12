import fs from 'fs-extra';
import path from 'path';

export function writeFile(root: string, relativePath: string, content: string): void {
  const fullPath = path.join(root, relativePath);
  fs.ensureDirSync(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf-8');
}

export function writeJson(root: string, relativePath: string, data: Record<string, unknown>): void {
  writeFile(root, relativePath, JSON.stringify(data, null, 2) + '\n');
}

export function ensureDir(root: string, relativePath: string): void {
  fs.ensureDirSync(path.join(root, relativePath));
}
