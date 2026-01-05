const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'CLAUDE.md');
const destination = path.join(__dirname, '..', 'AGENTS.md');

try {
  const sourceContent = fs.readFileSync(source, 'utf8');
  const destContent = fs.readFileSync(destination, 'utf8');

  if (sourceContent !== destContent) {
    console.error('❌ CLAUDE.md and AGENTS.md are out of sync!');
    console.error('Run: npm run sync:agents');
    process.exit(1);
  }

  console.log('✅ CLAUDE.md and AGENTS.md are in sync');
} catch (error) {
  console.error('❌ Error checking sync:', error.message);
  process.exit(1);
}
