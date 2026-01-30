#!/usr/bin/env node

/**
 * Fix CLI permissions and shebang
 * Ensures dist/cli.js has:
 * 1. Correct shebang for Node.js
 * 2. Execute permissions on Unix/macOS
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, '..', 'dist', 'cli.js');

try {
  // Read the CLI file
  let content = fs.readFileSync(cliPath, 'utf-8');

  // Ensure shebang is present and correct
  const shebang = '#!/usr/bin/env node\n';
  if (!content.startsWith('#!')) {
    console.log('📝 Adding shebang to dist/cli.js');
    content = shebang + content;
    fs.writeFileSync(cliPath, content, 'utf-8');
  } else if (!content.startsWith(shebang)) {
    console.log('🔧 Fixing shebang in dist/cli.js');
    content = shebang + content.slice(content.indexOf('\n') + 1);
    fs.writeFileSync(cliPath, content, 'utf-8');
  }

  // Make file executable on Unix/macOS
  if (process.platform !== 'win32') {
    fs.chmodSync(cliPath, 0o755);
    console.log('✅ Made dist/cli.js executable (755)');
  } else {
    console.log('ℹ️  Windows detected - skipping chmod');
  }

  console.log('✅ CLI permissions fixed');
} catch (error) {
  console.error('❌ Error fixing CLI permissions:', error.message);
  process.exit(1);
}
