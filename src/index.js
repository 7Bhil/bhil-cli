#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import { createProject } from './commands/create.js';
import { addPackage } from './commands/add.js';
import { listTemplates } from './commands/list.js';
import chalk from 'chalk';

function colorLine(text) {
  const colors = [
    chalk.hex('#00D2FF'),
    chalk.hex('#B9F2FF'),
    chalk.hex('#E2E8F0'),
  ];
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const colorIdx = Math.min(
      Math.floor((1 - i / text.length) * colors.length),
      colors.length - 1
    );
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
    `      #########  ###    ### ########### ########## ###     ### ########## .`,
  ];
  console.log('');
  logo.forEach(line => console.log(colorLine(line)));
  console.log(chalk.gray(`  ───────────────────────────── bhil-cli v1.0.0 ─────────────────────────────`));
  console.log('');
}

async function showDashboard() {
  showSplash();
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Que veux-tu faire ?',
    choices: [
      { name: 'Créer un nouveau projet', value: 'create' },
      { name: 'Ajouter des librairies',  value: 'add' },
      { name: 'Voir les templates',      value: 'list' },
      { name: 'Quitter',                 value: 'exit' },
    ],
  }]);

  if (action === 'create') {
    await createProject(undefined, {});
  } else if (action === 'add') {
    const { pkgs } = await inquirer.prompt([{
      type: 'input',
      name: 'pkgs',
      message: 'Librairies à ajouter (alias ou noms npm séparés par des espaces) :',
      validate: v => v.trim() ? true : 'Entre au moins une librairie',
    }]);
    await addPackage(pkgs.trim().split(/\s+/), {});
  } else if (action === 'list') {
    listTemplates();
  } else {
    process.exit(0);
  }
}

program
  .name('bhil')
  .description('Crée et gère tes projets en quelques secondes')
  .version('1.0.0');

program
  .command('create [name]')
  .alias('new')
  .description('Créer un nouveau projet')
  .option('-f, --framework <framework>', 'Framework (react, next, vue, svelte...)')
  // FIX: suppression du default 'npm' pour laisser detectPM() s'exécuter dans create.js
  .option('-p, --pm <pm>', 'Gestionnaire de paquets (npm, yarn, pnpm, bun)')
  .option('--ts', 'Ajouter TypeScript')
  .option('--tailwind', 'Ajouter Tailwind CSS')
  // FIX: --router supprimé (option déclarée mais jamais traitée dans create.js)
  .option('--no-install', 'Ne pas installer les dépendances')
  .action(createProject);

program
  .command('add <packages...>')
  .description('Ajouter des librairies à ton projet')
  .option('-p, --pm <pm>', 'Gestionnaire de paquets')
  .option('-D, --dev', 'Installer en devDependencies')
  .action(addPackage);

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
