import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { FRAMEWORKS, POPULAR_LIBS, getInstallCmd, getDevInstallCmd, getDevCmd, getBaseInstallCmd, detectPM } from '../templates/registry.js';
import fs from 'fs';
import path from 'path';

export async function createProject(name, options) {
  let projectName = name;
  let framework = options.framework;
  let pm = options.pm || detectPM() || 'npm';
  let useTs = options.ts;
  let addTailwind = options.tailwind;
  let extraLibs = [];

  // ── Mode interactif si pas assez d'infos ──────────────
  const questions = [];

  if (!projectName) {
    questions.push({
      type: 'input',
      name: 'projectName',
      message: 'Nom du projet :',
      default: 'mon-app',
      validate: v => v.trim() ? true : 'Donne un nom à ton projet',
    });
  }

  if (!framework) {
    questions.push({
      type: 'list',
      name: 'framework',
      message: 'Quel framework ?',
      choices: Object.entries(FRAMEWORKS).map(([key, val]) => ({
        name: `${val.label}`,
        value: key,
      })),
    });
  }

  questions.push({
    type: 'list',
    name: 'pm',
    message: 'Gestionnaire de paquets :',
    choices: ['npm', 'yarn', 'pnpm', 'bun'],
    default: pm,
    when: !options.pm,
  });

  questions.push({
    type: 'confirm',
    name: 'useTs',
    message: 'TypeScript ?',
    default: false,
    when: !useTs,
  });

  questions.push({
    type: 'checkbox',
    name: 'libs',
    message: 'Librairies à ajouter :',
    choices: Object.entries(POPULAR_LIBS).map(([key, val]) => ({
      name: val.label,
      value: key,
    })),
  });

  // Poser les questions manquantes
  let answers = {};
  if (questions.length > 0) {
    answers = await inquirer.prompt(questions);
  }

  // Fusionner les réponses avec les options
  projectName = projectName || answers.projectName;

  if (fs.existsSync(projectName)) {
    console.error(chalk.red(`\n  Erreur : Le dossier "${projectName}" existe déjà. Veuillez le supprimer ou choisir un autre nom.\n`));
    return;
  }

  framework   = framework   || answers.framework;
  pm          = answers.pm  || pm;
  useTs       = useTs       || answers.useTs;
  extraLibs   = answers.libs || [];
  addTailwind = addTailwind || extraLibs.includes('tailwind');

  // ── Récap avant de lancer ─────────────────────────────
  console.log('');
  console.log(chalk.bold('  Ton projet :'));
  console.log(`  ${chalk.gray('Nom')}         ${chalk.cyan(projectName)}`);
  console.log(`  ${chalk.gray('Framework')}   ${chalk.cyan(FRAMEWORKS[framework]?.label || framework)}`);
  console.log(`  ${chalk.gray('Paquets')}     ${chalk.cyan(pm)}`);
  console.log(`  ${chalk.gray('TypeScript')}  ${useTs ? chalk.green('oui') : chalk.gray('non')}`);
  if (extraLibs.length) {
    console.log(`  ${chalk.gray('Librairies')}  ${chalk.cyan(extraLibs.map(k => POPULAR_LIBS[k]?.label || k).join(', '))}`);
  }
  console.log('');

  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'On lance ?',
    default: true,
  }]);

  if (!confirm) {
    console.log(chalk.gray('\n  Annulé.\n'));
    return;
  }

  // ── Création du projet ────────────────────────────────
  const fw = FRAMEWORKS[framework];
  const variant = useTs && fw?.variants?.ts ? 'ts' : 'default';
  const createCmd = fw?.variants?.[variant]?.cmd(pm, projectName);

  if (!createCmd || fw?.variants?.[variant]?.custom) {
    await createCustomProject(projectName, framework, pm);
  } else {
    const spinner = ora(`Création de ${chalk.cyan(projectName)}...`).start();
    try {
      await execa(createCmd, { shell: true, stdio: 'pipe' });
      spinner.succeed(`Projet ${chalk.cyan(projectName)} créé !`);
    } catch (e) {
      spinner.fail('Erreur lors de la création');
      console.error(chalk.red(e.message));
      return;
    }
  }

  // ── Installation globale des dépendances ────────────────
  if (options.install !== false) {
    const spinnerInst = ora('Installation des dépendances du projet...').start();
    try {
      await execa(getBaseInstallCmd(pm), { shell: true, cwd: projectName, stdio: 'pipe' });
      spinnerInst.succeed('Dépendances globales installées !');
    } catch(e) {
      spinnerInst.fail(`Erreur lors de l'installation des dépendances globales.`);
    }
  }

  // ── Librairies supplémentaires ────────────────────────
  const extraKeys = extraLibs.filter(l => l !== 'tailwind');
  const prodLibs  = extraKeys.filter(k => !POPULAR_LIBS[k]?.dev).flatMap(k => POPULAR_LIBS[k]?.pkg.split(' ') || []);
  const devLibs   = extraKeys.filter(k =>  POPULAR_LIBS[k]?.dev).flatMap(k => POPULAR_LIBS[k]?.pkg.split(' ') || []);

  if (prodLibs.length > 0 || devLibs.length > 0) {
    const spinner = ora('Installation des librairies supplémentaires...').start();
    try {
      if (prodLibs.length > 0) await execa(getInstallCmd(pm, prodLibs),    { shell: true, cwd: projectName, stdio: 'pipe' });
      if (devLibs.length  > 0) await execa(getDevInstallCmd(pm, devLibs),  { shell: true, cwd: projectName, stdio: 'pipe' });
      spinner.succeed('Librairies supplémentaires installées !');
    } catch (e) {
      spinner.fail('Erreur installation librairies');
      console.error(chalk.red(e.message));
    }
  }

  // ── Configuration Spéciale Tailwind ───────────────────
  if (addTailwind) {
    const spinnerTw = ora('Configuration de Tailwind CSS...').start();
    try {
      const pkg = POPULAR_LIBS['tailwind'].pkg.split(' ');
      await execa(getInstallCmd(pm, pkg), { shell: true, cwd: projectName, stdio: 'pipe' });
      await execa('npx tailwindcss@3 init -p', { shell: true, cwd: projectName, stdio: 'ignore' });
      spinnerTw.succeed('Tailwind CSS configuré !');
    } catch(e) {
      spinnerTw.fail('Erreur lors de la configuration de Tailwind');
    }
  }

  // ── Auto Git Initialization ───────────────────────────
  try {
    await execa('git init', { shell: true, cwd: projectName, stdio: 'ignore' });
    await execa('git add .', { shell: true, cwd: projectName, stdio: 'ignore' });
    await execa('git commit -m "Init par bhil"', { shell: true, cwd: projectName, stdio: 'ignore' });
  } catch (e) {
    console.log(chalk.yellow(`\n  ⚠️  Git : commit initial ignoré (configure user.name/user.email dans git si besoin).`));
  }

  // ── Instructions finales ──────────────────────────────
  const devPort = FRAMEWORKS[framework]?.port || null;
  console.log('');
  console.log(chalk.bold.green('  Tout est prêt ! Maintenant :'));
  console.log('');
  console.log(`  ${chalk.gray('$')} ${chalk.white(`cd ${projectName}`)}`);
  console.log(`  ${chalk.gray('$')} ${chalk.white(getDevCmd(pm))}`);
  console.log('');
  if (devPort) {
    console.log(`  ${chalk.gray('Ouvre')} ${chalk.cyan(`http://localhost:${devPort}`)} ${chalk.gray('dans ton navigateur')}`);
    console.log('');
  }
}

// Projet Node.js custom (avec Express)
async function createCustomProject(name, framework, pm) {
  const spinner = ora(`Création du projet ${chalk.cyan(name)}...`).start();
  try {
    fs.mkdirSync(name, { recursive: true });
    const pkg = {
      name,
      version: '1.0.0',
      type: 'module',
      scripts: { dev: 'node src/index.js', start: 'node src/index.js' },
      dependencies: { express: '^4.19.2' },
    };
    fs.writeFileSync(path.join(name, 'package.json'), JSON.stringify(pkg, null, 2));
    fs.mkdirSync(path.join(name, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(name, 'src', 'index.js'),
      `import express from 'express';\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get('/', (req, res) => res.json({ message: 'Bienvenue sur ${name} !' }));\n\napp.listen(PORT, () => console.log(\`Serveur démarré sur http://localhost:\${PORT}\`));\n`
    );
    spinner.succeed(`Projet ${chalk.cyan(name)} créé !`);
  } catch (e) {
    spinner.fail('Erreur');
    console.error(chalk.red(e.message));
  }
}
