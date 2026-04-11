import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { POPULAR_LIBS, getInstallCmd } from '../templates/registry.js';
import { FRAMEWORKS } from '../templates/registry.js';

// bhil add axios zustand tailwind
export async function addPackage(packages, options) {
  const pm = options.pm || 'npm';

  // Résoudre les alias (ex: "tailwind" → vrai package npm)
  const resolved = packages.map(p => {
    const alias = POPULAR_LIBS[p];
    return alias ? alias.pkg : p;
  });

  const flat = resolved.join(' ').split(' ').filter(Boolean);
  const cmd = getInstallCmd(pm, flat);

  console.log('');
  console.log(`  ${chalk.gray('Installation de')} ${chalk.cyan(packages.join(', '))}...`);
  console.log(`  ${chalk.gray('$')} ${cmd}`);
  console.log('');

  const spinner = ora('Installation...').start();
  try {
    await execa(cmd, { shell: true, stdio: 'pipe' });
    if (packages.includes('tailwind')) {
      await execa('npx tailwindcss init -p', { shell: true, stdio: 'ignore' });
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
    console.log(`  ${chalk.cyan(alias.padEnd(12))} ${chalk.gray('→')} ${val.label}`);
  });

  console.log('');
  console.log(chalk.bold('  Exemples :\n'));
  console.log(`  ${chalk.gray('$')} bhil create mon-app`);
  console.log(`  ${chalk.gray('$')} bhil create mon-app --framework next --ts --tailwind`);
  console.log(`  ${chalk.gray('$')} bhil new dashboard --framework react --pm pnpm`);
  console.log(`  ${chalk.gray('$')} bhil add axios zustand icons`);
  console.log('');
}
