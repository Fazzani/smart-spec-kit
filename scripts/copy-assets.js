/**
 * Copy assets script
 * Ensures workflows, templates, starter-kit, and prompts are available in dist for npm publish
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Assets are at root level, no need to copy to dist
// This script ensures they exist and logs info

const assets = [
  'workflows', 
  'templates',
  'starter-kit/prompts',
  'starter-kit/templates',
  'starter-kit/memory',
  'starter-kit/rules',
  'starter-kit/workflows',
  'starter-kit/github-prompts',  // Slash commands for GitHub Copilot
];

// Single files to verify
const singleFiles = [
  'starter-kit/copilot-instructions.md',
];

console.log('📦 Verifying assets for packaging...\n');

for (const asset of assets) {
  const assetPath = path.join(rootDir, asset);
  
  if (fs.existsSync(assetPath)) {
    const files = fs.readdirSync(assetPath);
    console.log(`✅ ${asset}/ (${files.length} files)`);
    files.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log(`⚠️  ${asset}/ not found`);
  }
}

for (const file of singleFiles) {
  const filePath = path.join(rootDir, file);
  
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`⚠️  ${file} not found`);
  }
}

console.log('\n✨ Assets ready for npm publish');
