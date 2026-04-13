import fs from 'fs';

export const FRAMEWORKS = {
  react: {
    label: 'React (Vite)',
    color: 'cyan',
    port: 5173,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, name, 'react') },
      ts:      { cmd: (pm, name) => pmCreate(pm, name, 'react-ts') },
    },
  },
  next: {
    label: 'Next.js',
    color: 'white',
    port: 3000,
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `create-next-app@latest ${name} --no-typescript --tailwind=false --eslint --app`) },
      ts:      { cmd: (pm, name) => pmExec(pm, `create-next-app@latest ${name} --typescript --tailwind=false --eslint --app`) },
    },
  },
  vue: {
    label: 'Vue 3 (Vite)',
    color: 'green',
    port: 5173,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, name, 'vue') },
      ts:      { cmd: (pm, name) => pmCreate(pm, name, 'vue-ts') },
    },
  },
  svelte: {
    label: 'Svelte (Vite)',
    color: 'red',
    port: 5173,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, name, 'svelte') },
      ts:      { cmd: (pm, name) => pmCreate(pm, name, 'svelte-ts') },
    },
  },
  sveltekit: {
    label: 'SvelteKit',
    color: 'red',
    port: 5173,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, name, null, 'svelte') },
    },
  },
  nuxt: {
    label: 'Nuxt 3',
    color: 'green',
    port: 3000,
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `nuxi@latest init ${name}`) },
    },
  },
  remix: {
    label: 'Remix',
    color: 'blue',
    port: 3000,
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `create-remix@latest ${name}`) },
    },
  },
  astro: {
    label: 'Astro',
    color: 'magenta',
    port: 4321,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, name, null, 'astro') },
    },
  },
  node: {
    label: 'Node.js + Express',
    color: 'yellow',
    port: 3000,
    variants: {
      default: { cmd: () => null, custom: true },
    },
  },
  electron: {
    label: 'Electron (App bureau)',
    color: 'blue',
    port: null,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, name, null, 'electron-vite') },
    },
  },
};

export const POPULAR_LIBS = {
  'tailwind': { pkg: 'tailwindcss postcss autoprefixer', label: 'Tailwind CSS v3', dev: true },
  'router':   { pkg: 'react-router-dom',                 label: 'React Router' },
  'axios':    { pkg: 'axios',                            label: 'Axios' },
  'query':    { pkg: '@tanstack/react-query',            label: 'TanStack Query' },
  'zustand':  { pkg: 'zustand',                          label: 'Zustand' },
  'mui':      { pkg: '@mui/material @emotion/react @emotion/styled', label: 'Material UI' },
  'framer':   { pkg: 'framer-motion',                    label: 'Framer Motion' },
  'zod':      { pkg: 'zod',                              label: 'Zod' },
  'rhf':      { pkg: 'react-hook-form',                  label: 'React Hook Form' },
  'icons':    { pkg: 'lucide-react',                     label: 'Lucide Icons' },
  'recharts': { pkg: 'recharts',                         label: 'Recharts' },
  'prisma':   { pkg: 'prisma @prisma/client',            label: 'Prisma ORM', dev: true },
  'supabase': { pkg: '@supabase/supabase-js',            label: 'Supabase' },
  'firebase': { pkg: 'firebase',                         label: 'Firebase' },
  'stripe':   { pkg: '@stripe/stripe-js stripe',         label: 'Stripe' },
  'auth':     { pkg: 'next-auth',                        label: 'NextAuth.js' },
};

// ── Helpers commandes ────────────────────────────────────

// FIX: chaque PM a sa propre syntaxe pour vite/svelte/astro
// npm/pnpm/bun: "create vite@latest name -- --template react"
// yarn: "create vite name --template react" (pas @latest, pas de --)
function pmCreate(pm, name, template, pkg) {
  const tool = pkg || 'vite@latest';
  const toolYarn = (pkg || 'vite').replace('@latest', '');
  const templateFlag = template ? ` --template ${template}` : '';
  const map = {
    npm:  `npm create ${tool} ${name}${template ? ` -- --template ${template}` : ''}`,
    yarn: `yarn create ${toolYarn} ${name}${templateFlag}`,
    pnpm: `pnpm create ${tool} ${name}${template ? ` -- --template ${template}` : ''}`,
    bun:  `bun create ${tool} ${name}${template ? ` -- --template ${template}` : ''}`,
  };
  return map[pm] || map.npm;
}

function pmExec(pm, rest) {
  const map = { npm: `npx ${rest}`, yarn: `yarn dlx ${rest}`, pnpm: `pnpm dlx ${rest}`, bun: `bunx ${rest}` };
  return map[pm] || map.npm;
}

// FIX: détecte aussi bun.lock (nouveau format bun >= 1.1) en plus de bun.lockb
export function detectPM() {
  const agent = process.env.npm_config_user_agent;
  if (agent) {
    if (agent.includes('pnpm')) return 'pnpm';
    if (agent.includes('yarn')) return 'yarn';
    if (agent.includes('bun'))  return 'bun';
    if (agent.includes('npm'))  return 'npm';
  }
  try {
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (pkg.packageManager) {
        if (pkg.packageManager.startsWith('pnpm')) return 'pnpm';
        if (pkg.packageManager.startsWith('yarn')) return 'yarn';
        if (pkg.packageManager.startsWith('bun'))  return 'bun';
        if (pkg.packageManager.startsWith('npm'))  return 'npm';
      }
    }
  } catch (_) {}
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock'))      return 'yarn';
  if (fs.existsSync('bun.lock'))       return 'bun';   // nouveau format
  if (fs.existsSync('bun.lockb'))      return 'bun';   // ancien format
  return null;
}

export function getInstallCmd(pm, pkgs) {
  const str = Array.isArray(pkgs) ? pkgs.join(' ') : pkgs;
  const map = { npm: `npm install ${str}`, yarn: `yarn add ${str}`, pnpm: `pnpm add ${str}`, bun: `bun add ${str}` };
  return map[pm] || map.npm;
}

export function getDevInstallCmd(pm, pkgs) {
  const str = Array.isArray(pkgs) ? pkgs.join(' ') : pkgs;
  const map = { npm: `npm install -D ${str}`, yarn: `yarn add -D ${str}`, pnpm: `pnpm add -D ${str}`, bun: `bun add -D ${str}` };
  return map[pm] || map.npm;
}

export function getBaseInstallCmd(pm) {
  const map = { npm: 'npm install', yarn: 'yarn install', pnpm: 'pnpm install', bun: 'bun install' };
  return map[pm] || 'npm install';
}

export function getDevCmd(pm) {
  const map = { npm: 'npm run dev', yarn: 'yarn dev', pnpm: 'pnpm dev', bun: 'bun dev' };
  return map[pm] || 'npm run dev';
}
