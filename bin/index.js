#!/usr/bin/env node

import('../dist/cli.js').catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
