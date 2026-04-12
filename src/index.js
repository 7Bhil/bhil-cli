#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import { createProject } from './commands/create.js';
import { addPackage } from './commands/add.js';
import { listTemplates } from './commands/list.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n  bhil') + chalk.gray(' — ton gestionnaire de projets\n'));

async function showDashboard() {
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Que veux-tu faire ?',
    choices: [
      { name: '🚀 Créer un nouveau projet', value: 'create' },
      { name: '📦 Ajouter des librairies', value: 'add' },
      { name: '📜 Voir les templates', value: 'list' },
      { name: '❌ Quitter', value: 'exit' }
    ]
  }]);

  switch (action) {
    case 'create':
      await createProject(undefined, {});
      break;
    case 'add':
      const { pkgs } = await inquirer.prompt([{
        type: 'input',
        name: 'pkgs',
        message: 'Librairies à ajouter (alias ou noms npm séparés par des espaces) :'
      }]);
      if (pkgs.trim()) {
        await addPackage(pkgs.split(' ').filter(Boolean), {});
      }
      break;
    case 'list':
      listTemplates();
      break;
    default:
      process.exit(0);
  }
}

program
  .name('bhil')
  .description('Crée et gère tes projets en quelques secondes')
  .version('1.0.0');

// bhil create [nom] — mode interactif ou rapide
program
  .command('create [name]')
  .alias('new')
  .description('Créer un nouveau projet')
  .option('-f, --framework <framework>', 'Framework à utiliser (react, next, vue, svelte...)')
  .option('-p, --pm <pm>', 'Gestionnaire de paquets (npm, yarn, pnpm, bun)', 'npm')
  .option('--ts', 'Ajouter TypeScript')
  .option('--tailwind', 'Ajouter Tailwind CSS')
  .option('--router', 'Ajouter le router')
  .option('--no-install', 'Ne pas installer les dépendances')
  .action(createProject);

// bhil add — ajouter des librairies
program
  .command('add <packages...>')
  .description('Ajouter des librairies à ton projet')
  .option('-p, --pm <pm>', 'Gestionnaire de paquets', 'npm')
  .option('-D, --dev', 'Installer en devDependencies')
  .action(addPackage);

// bhil list — voir les templates disponibles
program
  .command('list')
  .alias('ls')
  .description('Lister tous les templates disponibles')
  .action(listTemplates);

if (!process.argv.slice(2).length) {
  showDashboard();
} else {
  program.parse();
}
