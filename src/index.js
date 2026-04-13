#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import { createProject } from './commands/create.js';
import { addPackage } from './commands/add.js';
import { listTemplates } from './commands/list.js';
import chalk from 'chalk';

const DIAMOND = chalk.hex('#B9F2FF');
const CYAN = chalk.hex('#00D2FF');
const BLUE = chalk.hex('#3A7BD5');
const PURPLE = chalk.hex('#8E2DE2');

const DIAMOND_COLORS = [
  '#00D2FF', // Cyan (Right)
  '#B9F2FF', // Diamond
  '#E2E8F0'  // Silver (Left)
];

function colorLine(text) {
  const colors = DIAMOND_COLORS.map(c => chalk.hex(c));
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ratio = i / text.length;
    // Inversion pour le dégradé Droite-Vers-Gauche
    const colorIdx = Math.min(Math.floor((1 - ratio) * colors.length), colors.length - 1);
    result += colors[colorIdx](text[i]);
  }
  return result;
}

function showSplash() {
  const logo = [
    `      :::::::::  :::    ::: ::::::::::: :::            :::     :::        `,
    `      :+:    :+: :+:    :+:     :+:     :+:          :+: :+:   :+:        `,
    `      +:+    +:+ +:+    +:+     +:+     +:+         +:+   +:+  +:+        `,
    `      +#++:++#+  +#++:++#++     +#+     +#+        +#++:++#++: +#+        `,
    `      +#+    +#+ +#+    +#+     +#+     +#+        +#+     +#+ +#+        `,
    `      #+#    #+# #+#    #+#     #+#     #+#        #+#     +#+ #+#        `,
    `      #########  ###    ### ########### ########## ###     ### ########## .`
  ];

  console.log('');
  logo.forEach(line => console.log(colorLine(line)));
  console.log(chalk.gray(`  ─────────────────────────────────── bhil-cli v1.0.0 ───────────────────────────────────`));
  console.log('');
}

async function showDashboard() {
  showSplash();
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
