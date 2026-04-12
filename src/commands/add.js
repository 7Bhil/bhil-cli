import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs';
import { POPULAR_LIBS, FRAMEWORKS, getInstallCmd, getDevInstallCmd, detectPM } from '../templates/registry.js';

// bhil add axios zustand tailwind
export async function addPackage(packages, options) {
  const pm = options.pm || detectPM();
  const forceDev = options.dev || false;

  // Vérifier qu'on est dans un projet Node.js
  if (!fs.existsSync('package.json')) {
    console.error(chalk.red('\n  Erreur : Aucun package.json trouvé dans le dossier courant.'));
    console.error(chalk.gray('  Lance cette commande depuis la racine de ton projet.\n'));
    return;
  }

  // Résoudre les alias (ex: "tailwind" → vrais packages npm)
  const resolved = packages.map(p => {
    const alias = POPULAR_LIBS[p];
    return { pkgs: (alias ? alias.pkg : p).split(' ').filter(Boolean), isDev: alias?.dev || false };
  });

  // Séparer les packages prod et dev
  const devPkgs  = resolved.filter(r => forceDev || r.isDev).flatMap(r => r.pkgs);
  const prodPkgs = resolved.filter(r => !forceDev && !r.isDev).flatMap(r => r.pkgs);

  console.log('');
  console.log(`  ${chalk.gray('Installation de')} ${chalk.cyan(packages.join(', '))}...`);
  console.log('');

  const spinner = ora('Installation...').start();
  try {
    if (prodPkgs.length > 0) await execa(getInstallCmd(pm, prodPkgs),   { shell: true, stdio: 'pipe' });
    if (devPkgs.length  > 0) await execa(getDevInstallCmd(pm, devPkgs), { shell: true, stdio: 'pipe' });

    // Configuration spéciale Tailwind
    if (packages.includes('tailwind')) {
      await execa('npx tailwindcss@3 init -p', { shell: true, stdio: 'ignore' });
    }

    spinner.succeed(`${chalk.cyan(packages.join(', '))} installé${packages.length > 1 ? 's' : ''} !`);
  } catch (e) {
    spinner.fail('Erreur lors de l\'installation');
    console.error(chalk.red(e.message));
  }
  console.log('');
}

// bhil list
export function listTemplates() {
  console.log('');
  console.log(chalk.bold('  Frameworks disponibles :\n'));

  Object.entries(FRAMEWORKS).forEach(([key, val]) => {
    const hasTs = !!val.variants?.ts;
    const tsTag = hasTs ? chalk.blue(' [TS]') : '';
    console.log(`  ${chalk.gray('bhil create mon-app --framework')} ${chalk.cyan(key.padEnd(12))} ${chalk.white(val.label)}${tsTag}`);
  });

  console.log('');
  console.log(chalk.bold('  Librairies rapides (bhil add <alias>) :\n'));

  Object.entries(POPULAR_LIBS).forEach(([alias, val]) => {
    const devTag = val.dev ? chalk.yellow(' [dev]') : '';
    console.log(`  ${chalk.cyan(alias.padEnd(12))} ${chalk.gray('→')} ${val.label}${devTag}`);
  });

  console.log('');
  console.log(chalk.bold('  Exemples :\n'));
  console.log(`  ${chalk.gray('$')} bhil create mon-app`);
  console.log(`  ${chalk.gray('$')} bhil create mon-app --framework next --ts --tailwind`);
  console.log(`  ${chalk.gray('$')} bhil new dashboard --framework react --pm pnpm`);
  console.log(`  ${chalk.gray('$')} bhil add axios zustand icons`);
  console.log(`  ${chalk.gray('$')} bhil add tailwind --dev`);
  console.log('');
}
