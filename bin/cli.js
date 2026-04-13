#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from '../src/commands/init.js';
import { addCommand } from '../src/commands/add.js';
import { initRulesCommand } from '../src/commands/init-rules.js';
import { initContextCommand } from '../src/commands/init-context.js';
import { initWorkflowCommand } from '../src/commands/init-workflow.js';
import { initCheckCommand } from '../src/commands/init-check.js';

const program = new Command();
program.name('evnict-kit').description('EVNICT AI-Assisted Development Toolkit v0.2.1').version('0.2.1');

program.command('init')
  .description('Khởi tạo workspace + deploy rules/skills/workflows vào từng project (interactive hoặc flags)')
  .option('--name <n>', 'Tên dự án (nếu bỏ qua → interactive wizard)')
  .option('--be <folder>', 'Folder backend (default: <n>-be)')
  .option('--fe <folder>', 'Folder frontend (default: <n>-fe)')
  .option('--tool <tool>', 'AI tool: antigravity|claude|cursor|copilot|codex', 'antigravity')
  .option('--tech-be <tech>', 'springboot|aspnet|javaee', 'springboot')
  .option('--tech-fe <tech>', 'angular|react-web|react-mobile', 'angular')
  .option('--db <db>', 'oracle|sqlserver', 'oracle')
  .option('--no-wiki', 'Không setup wiki')
  .option('--no-interactive', 'Bắt buộc chạy non-interactive (cần --name)')
  .action(initCommand);

program.command('add <folder>')
  .description('Thêm 1 project vào workspace đã init (deploy rules/skills/workflows + symlinks)')
  .option('--type <type>', 'backend|frontend')
  .option('--tech <tech>', 'springboot|angular|react-web|react-mobile|aspnet')
  .option('--tool <tool>', 'AI tool override')
  .action(addCommand);

program.command('init-rules').description('Scaffold rules vào từng project (theo --tool)').option('--tool <tool>','','antigravity').action(initRulesCommand);
program.command('init-context').description('Scaffold context files vào từng project').option('--tool <tool>','','antigravity').action(initContextCommand);
program.command('init-workflow').description('Scaffold workflows & skills vào từng project').option('--tool <tool>','','antigravity').action(initWorkflowCommand);
program.command('init-check').description('Chuẩn bị demo-check directory').option('--tool <tool>','','antigravity').action(initCheckCommand);

program.parse();
