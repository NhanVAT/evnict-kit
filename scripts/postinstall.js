#!/usr/bin/env node

/**
 * Post-install banner - shown when user runs npm install evnict-kit
 */

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
};

const version = '0.2.3';

console.log('');
console.log(`${c.bold}${c.cyan}  +====================================================+${c.reset}`);
console.log(`${c.bold}${c.cyan}  |                                                    |${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   EVNICT-KIT ${c.dim}v${version}${c.reset}  ${c.green}installed successfully!${c.reset}     ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}AI-Assisted Development Toolkit${c.reset}                  ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |                                                    |${c.reset}`);
console.log(`${c.bold}${c.cyan}  +====================================================+${c.reset}`);
console.log(`${c.bold}${c.cyan}  |                                                    |${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.bold}Quick Start:${c.reset}                                     ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}$${c.reset} ${c.cyan}evnict-kit init --name=myapp${c.reset}                 ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |                                                    |${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.bold}Useful Commands:${c.reset}                                 ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}$${c.reset} ${c.cyan}evnict-kit doctor${c.reset}  ${c.dim}Health check & updates${c.reset}     ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}$${c.reset} ${c.cyan}evnict-kit info${c.reset}    ${c.dim}Toolkit statistics${c.reset}        ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}$${c.reset} ${c.cyan}evnict-kit upgrade${c.reset} ${c.dim}Update to latest${c.reset}          ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}$${c.reset} ${c.cyan}evnict-kit --help${c.reset}  ${c.dim}All commands${c.reset}              ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |                                                    |${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}5 Rules | 22 Skills | 17 Workflows${c.reset}              ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}Supports: Antigravity | Claude | Cursor${c.reset}         ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |${c.reset}   ${c.dim}          Copilot | Codex${c.reset}                        ${c.bold}${c.cyan}|${c.reset}`);
console.log(`${c.bold}${c.cyan}  |                                                    |${c.reset}`);
console.log(`${c.bold}${c.cyan}  +====================================================+${c.reset}`);
console.log('');
