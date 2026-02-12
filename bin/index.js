#!/usr/bin/env node

const { cli } = require('../src/cli');
cli(process.argv.slice(2)).catch((err) => {
  console.error(err.message);
  process.exit(1);
});
