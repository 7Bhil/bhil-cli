import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import {
  FRAMEWORKS, POPULAR_LIBS,
  getInstallCmd, getDevInstallCmd, getBaseInstallCmd, getDevCmd, detectPM,
} from '../templates/registry.js';
import { REACT_PREMIUM_APP, REACT_PREMIUM_CSS } from '../templates/boilerplate.js';
import fs from 'fs';
import path from 'path';

export async function createProject(name, options) {
  let projectName = name;
  let framework   = options.framework;
  // FIX: options.pm peut être undefined maintenant (plus de default 'npm' dans index.js)
  // donc detectPM() s'exécute vraiment quand aucun --pm n'est passé
  let pm          = options.pm || detectPM() || 'npm';
  let useTs       = options.ts     || false;
  let addTailwind = options.tailwind || false;
  let extraLibs   = [];

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
      choices: Object.entries(FRAMEWORKS).map(([key, val]) => ({ name: val.label, value: key })),
    });
  }

  // FIX: when basé sur options.pm (undefined si non fourni), pas sur la valeur par défaut
  questions.push({
    type: 'list',
    name: 'pm',
    message: 'Gestionnaire de paquets :',
    choices: ['npm', 'yarn', 'pnpm', 'bun'],
    default: pm,
    when: (answers) => !options.pm && FRAMEWORKS[answers.framework || framework]?.type === 'js',
  });

  questions.push({
    type: 'confirm',
    name: 'useTs',
    message: 'TypeScript ?',
    default: false,
    when: (answers) => !useTs && FRAMEWORKS[answers.framework || framework]?.type === 'js',
  });

  questions.push({
    type: 'checkbox',
    name: 'libs',
    message: 'Librairies à ajouter :',
    choices: Object.entries(POPULAR_LIBS).map(([key, val]) => ({ name: val.label, value: key })),
    when: (answers) => FRAMEWORKS[answers.framework || framework]?.type === 'js',
  });

  let answers = {};
  if (questions.length > 0) {
    answers = await inquirer.prompt(questions);
  }

  projectName = (projectName || answers.projectName).trim();
  // Sanitize: remove chars that could break shell or paths
  projectName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-');

  if (fs.existsSync(projectName)) {
    console.error(chalk.red(`\n  Erreur : Le dossier "${projectName}" existe déjà.\n`));
    return;
  }

  framework   = framework   || answers.framework;
  pm          = answers.pm  || pm;
  useTs       = useTs       || answers.useTs  || false;
  extraLibs   = answers.libs || [];
  addTailwind = addTailwind || extraLibs.includes('tailwind');

  // Récap
  console.log('');
  console.log(chalk.bold('  Ton projet :'));
  console.log(`  ${chalk.gray('Nom')}         ${chalk.cyan(projectName)}`);
  console.log(`  ${chalk.gray('Framework')}   ${chalk.cyan(FRAMEWORKS[framework]?.label || framework)}`);
  if (FRAMEWORKS[framework]?.type === 'js') {
    console.log(`  ${chalk.gray('Paquets')}     ${chalk.cyan(pm)}`);
    console.log(`  ${chalk.gray('TypeScript')}  ${useTs ? chalk.green('oui') : chalk.gray('non')}`);
    if (extraLibs.length) {
      console.log(`  ${chalk.gray('Librairies')}  ${chalk.cyan(extraLibs.map(k => POPULAR_LIBS[k]?.label || k).join(', '))}`);
    }
  }
  console.log('');

  const { confirm } = await inquirer.prompt([{
    type: 'confirm', name: 'confirm', message: 'On lance ?', default: true,
  }]);
  if (!confirm) { console.log(chalk.gray('\n  Annulé.\n')); return; }

  // ── Création ────────────────────────────────────────────
  const fw      = FRAMEWORKS[framework];
  const variant = useTs && fw?.variants?.ts ? 'ts' : 'default';
  const createCmd = fw?.variants?.[variant]?.cmd(pm, projectName);

  // Vérif outils pour frameworks non-JS
  if (fw.type !== 'js') {
    const bin = fw.reqBin || (fw.type === 'python' ? 'python' : (fw.type === 'php' ? 'composer' : (fw.type === 'dart' ? 'flutter' : (fw.type === 'java' ? 'java' : null))));
    if (bin) {
      try { await execa(`which ${bin}`, { shell: true }); }
      catch (_) {
        console.error(chalk.red(`\n  Erreur : L'outil "${bin}" est requis pour ce framework mais n'a pas été trouvé.`));
        console.log(chalk.gray(`  Installe ${bin} et réessaye.\n`));
        return;
      }
    }
  }

  if (!createCmd || fw?.variants?.[variant]?.custom) {
    await createCustomProject(projectName, pm);
  } else {
    const spinner = ora(`Création de ${chalk.cyan(projectName)}...`).start();
    try {
      await execa(createCmd, { shell: true, stdio: 'pipe' });
      spinner.succeed(`Projet ${chalk.cyan(projectName)} créé !`);
    } catch (e) {
      spinner.fail('Erreur lors de la création');
      console.error(chalk.red(e.stderr || e.message));
      return;
    }
  }

  // ── Install dépendances de base (skip si déjà fait par le framework) ──
  if (options.install !== false && fw.type === 'js') {
    if (fs.existsSync(path.join(projectName, 'node_modules'))) {
      console.log(chalk.gray('  Dépendances déjà installées.'));
    } else {
      const spinner = ora('Installation des dépendances...').start();
      try {
        if (pm === 'yarn') fs.writeFileSync(path.join(projectName, 'yarn.lock'), '');
        await execa(getBaseInstallCmd(pm), { shell: true, cwd: projectName, stdio: 'pipe' });
        spinner.succeed('Dépendances installées !');
      } catch (e) {
        spinner.fail(`Erreur installation dépendances`);
        console.error(chalk.gray(`  ${e.message.split('\n')[0]}`));
      }
    }
  }

  // ── Librairies supplémentaires (prod/dev séparés) ────────
  // FIX: Prisma et autres libs marquées dev:true bien installées en -D
  if (fw.type === 'js') {
    const extraKeys = extraLibs.filter(l => l !== 'tailwind');
    const prodPkgs  = extraKeys
      .filter(k => !POPULAR_LIBS[k]?.dev)
      .flatMap(k => (POPULAR_LIBS[k]?.pkg || k).split(' '));
    const devPkgs   = extraKeys
      .filter(k => POPULAR_LIBS[k]?.dev)
      .flatMap(k => POPULAR_LIBS[k].pkg.split(' '));

    if (prodPkgs.length > 0 || devPkgs.length > 0) {
      const spinner = ora('Installation des librairies...').start();
      try {
        if (prodPkgs.length > 0) await execa(getInstallCmd(pm, prodPkgs),    { shell: true, cwd: projectName, stdio: 'pipe' });
        if (devPkgs.length  > 0) await execa(getDevInstallCmd(pm, devPkgs),  { shell: true, cwd: projectName, stdio: 'pipe' });
        spinner.succeed('Librairies installées !');
      } catch (e) {
        spinner.fail('Erreur installation librairies');
        console.error(chalk.red(e.message));
      }
    }
  }

  // ── Tailwind (v4) ────────────────────────────────────────
  if (addTailwind && fw.type === 'js') {
    const spinner = ora('Configuration de Tailwind CSS v4...').start();
    try {
      const twPkgs = POPULAR_LIBS['tailwind'].pkg.split(' ');
      await execa(getDevInstallCmd(pm, twPkgs), { shell: true, cwd: projectName, stdio: 'pipe' });

      // Création de postcss.config.mjs (syntaxe v4)
      const postcssConfig = "export default {\n  plugins: {\n    '@tailwindcss/postcss': {},\n  },\n};\n";
      fs.writeFileSync(path.join(projectName, 'postcss.config.mjs'), postcssConfig);

      // Ajout de l'import Tailwind dans le CSS principal
      const cssPath = framework === 'next' 
        ? path.join(projectName, 'app', 'globals.css') 
        : path.join(projectName, 'src', 'index.css');
      
      let cssContent = '@import "tailwindcss";\n';
      if (fs.existsSync(cssPath)) {
        cssContent += '\n' + fs.readFileSync(cssPath, 'utf8');
      }
      
      // S'assurer que le dossier parent existe (cas de Next.js app dir)
      const cssDir = path.dirname(cssPath);
      if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });
      
      fs.writeFileSync(cssPath, cssContent);

      spinner.succeed('Tailwind CSS v4 configuré !');
    } catch (e) {
      spinner.fail('Erreur configuration Tailwind');
      console.error(chalk.gray(`  ${e.message.split('\n')[0]}`));
    }
  }

  // ── Git ──────────────────────────────────────────────────
  try {
    await execa('git init',                              { shell: true, cwd: projectName, stdio: 'ignore' });
    await execa('git add .',                             { shell: true, cwd: projectName, stdio: 'ignore' });
    await execa('git commit -m "Init par bhil"',         { shell: true, cwd: projectName, stdio: 'ignore' });
  } catch (_) {
    console.log(chalk.yellow(`\n  Git : commit initial ignoré (configure user.name/user.email si besoin).`));
  }

  // ── Thème premium React ──────────────────────────────────
  if (framework === 'react') {
    const ext     = useTs ? 'tsx' : 'jsx';
    const appPath = path.join(projectName, 'src', `App.${ext}`);
    const cssPath = path.join(projectName, 'src', 'App.css');
    const idxCss  = path.join(projectName, 'src', 'index.css');
    const htmlPath = path.join(projectName, 'index.html');
    const mainPath = path.join(projectName, 'src', `main.${ext}`);

    try {
      fs.writeFileSync(appPath, REACT_PREMIUM_APP(projectName));
      fs.writeFileSync(cssPath, REACT_PREMIUM_CSS);
      if (!addTailwind) {
        fs.writeFileSync(idxCss, '/* reset by bhil */\n');
      } else {
        // Si tailwind est là, on ne vide pas le fichier car il contient @import "tailwindcss"
        fs.appendFileSync(idxCss, '\n/* theme reset */\n');
      }

      // main.jsx / main.tsx
      // FIX: import React supprimé (inutile avec Vite JSX transform automatique)
      const appImport = useTs ? `import App from './App'` : `import App from './App.jsx'`;
      const mainContent = [
        `import ReactDOM from 'react-dom/client';`,
        appImport + ';',
        `import './index.css';`,
        ``,
        `ReactDOM.createRoot(document.getElementById('root')${useTs ? '!' : ''}).render(<App />);`,
      ].join('\n');
      fs.writeFileSync(mainPath, mainContent);

      // Mise à jour index.html
      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace(/<title>.*?<\/title>/, `<title>${projectName}</title>`);
        html = html.replace(/src="\/src\/[^"]*"/, `src="/src/main.${ext}"`);
        fs.writeFileSync(htmlPath, html);
      }

      // Favicon bhil
      const faviconPath = path.join(projectName, 'public', 'favicon.svg');
      if (fs.existsSync(path.dirname(faviconPath))) {
        fs.writeFileSync(faviconPath,
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
          `<rect width="100" height="100" rx="20" fill="#8b5cf6"/>` +
          `<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" ` +
          `font-family="sans-serif" font-size="60" fill="white" font-weight="bold">B</text></svg>`
        );
      }

      // Fail-safe react/react-dom (surtout utile avec yarn)
      const pkgPath = path.join(projectName, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (!pkg.dependencies?.react) {
          pkg.dependencies = { ...pkg.dependencies, react: '^18.3.1', 'react-dom': '^18.3.1' };
          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        }
      }
    } catch (e) {
      console.warn(chalk.yellow(`  Thème premium : ${e.message.split('\n')[0]}`));
    }
  }

  // ── Instructions finales ─────────────────────────────────
  const devPort = fw?.port;
  const startCmd = fw?.devCmd || getDevCmd(pm);
  console.log('');
  console.log(chalk.bold.green('  Tout est prêt !'));
  console.log('');
  console.log(`  ${chalk.gray('$')} ${chalk.white(`cd ${projectName}`)}`);
  console.log(`  ${chalk.gray('$')} ${chalk.white(startCmd)}`);
  if (devPort) {
    console.log('');
    console.log(`  ${chalk.gray('Ouvre')} ${chalk.cyan(`http://localhost:${devPort}`)}`);
  }
  console.log('');
}

async function createCustomProject(name, pm) {
  const spinner = ora(`Création de ${chalk.cyan(name)}...`).start();
  try {
    fs.mkdirSync(path.join(name, 'src'), { recursive: true });
    const pkg = {
      name, version: '1.0.0', type: 'module',
      scripts: { dev: 'node src/index.js', start: 'node src/index.js' },
      dependencies: { express: '^4.19.2' },
    };
    fs.writeFileSync(path.join(name, 'package.json'), JSON.stringify(pkg, null, 2));
    fs.writeFileSync(
      path.join(name, 'src', 'index.js'),
      `import express from 'express';\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\n` +
      `app.get('/', (req, res) => res.json({ message: 'Bienvenue sur ${name} !' }));\n\n` +
      `app.listen(PORT, () => console.log(\`Serveur sur http://localhost:\${PORT}\`));\n`
    );
    spinner.succeed(`Projet ${chalk.cyan(name)} créé !`);
  } catch (e) {
    spinner.fail('Erreur');
    console.error(chalk.red(e.message));
  }
}
