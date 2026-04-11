#!/usr/bin/env node

import { program } from 'commander';
import { createProject } from './commands/create.js';
import { addPackage } from './commands/add.js';
import { listTemplates } from './commands/list.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n  bhil') + chalk.gray(' — ton gestionnaire de projets\n'));

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

program.parse();
