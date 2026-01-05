const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'CLAUDE.md');
const destination = path.join(__dirname, '..', 'AGENTS.md');

try {
  fs.copyFileSync(source, destination);
  console.log('✅ Synced CLAUDE.md → AGENTS.md');
} catch (error) {
  console.error('❌ Failed to sync AGENTS.md:', error.message);
  process.exit(1);
}
