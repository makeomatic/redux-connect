#!/usr/bin/env node

const execSync = require('child_process').execSync;
const stat = require('fs').stat;

function exec(command) {
  execSync(command, { stdio: [0, 1, 2] });
}

stat('lib', (error, stats) => {
  if (error || !stats.isDirectory()) {
    exec('npm run build');
  }
});
