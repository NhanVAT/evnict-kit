#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../src/commands/init.js';
import { addCommand } from '../src/commands/add.js';
import { doctorCommand } from '../src/commands/doctor.js';
import { infoCommand } from '../src/commands/info.js';
import { upgradeCommand } from '../src/commands/upgrade.js';
import { syncCommand } from '../src/commands/sync.js';

const program = new Command();
program.name('evnict-kit').description('EVNICT AI-Assisted Development Toolkit v0.2.3').version('0.2.3');

program.command('init')
  .description('Khoi tao workspace + deploy rules/skills/workflows vao tung project')
  .option('--name <n>', 'Ten du an (neu bo qua -> interactive wizard)')
  .option('--be <folder>', 'Folder backend (default: <n>-be)')
  .option('--fe <folder>', 'Folder frontend (default: <n>-fe)')
  .option('--tool <tool>', 'AI tool: antigravity|claude|cursor|copilot|codex', 'antigravity')
  .option('--tech-be <tech>', 'springboot|aspnet|javaee', 'springboot')
  .option('--tech-fe <tech>', 'angular|react-web|react-mobile', 'angular')
  .option('--db <db>', 'oracle|sqlserver', 'oracle')
  .option('--no-wiki', 'Khong setup wiki')
  .option('--no-interactive', 'Bat buoc chay non-interactive (can --name)')
  .action(initCommand);

program.command('add <folder>')
  .description('Them 1 project vao workspace da init (deploy rules/skills/workflows + symlinks)')
  .option('--type <type>', 'backend|frontend')
  .option('--tech <tech>', 'springboot|angular|react-web|react-mobile|aspnet')
  .option('--tool <tool>', 'AI tool override')
  .action(addCommand);

// ── Utility Commands ──
program.command('doctor')
  .description('Check environment, version, updates - health check')
  .action(doctorCommand);

program.command('info')
  .description('Show toolkit statistics - rules, skills, workflows, tools')
  .action(infoCommand);

program.command('upgrade')
  .description('Check and upgrade to latest version')
  .option('-y, --yes', 'Auto-confirm upgrade')
  .action(upgradeCommand);

program.command('sync')
  .description('Re-deploy templates (workflows/skills/rules) vao cac project da init — ghi de files evnict-kit, giu nguyen files user')
  .option('-y, --yes', 'Auto-confirm sync (khong hoi)')
  .action(syncCommand);

program.parse();
