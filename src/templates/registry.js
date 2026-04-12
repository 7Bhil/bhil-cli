// Tu peux en ajouter facilement ici !
import fs from 'fs';

export const FRAMEWORKS = {
  // ── React ──────────────────────────────────────────────
  react: {
    label: 'React (Vite)',
    color: 'cyan',
    port: 5180, // Changé de 5173 pour éviter le cache Service Worker conflictuel
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template react`) },
      ts:      { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template react-ts`) },
    },
  },

  // ── Next.js ────────────────────────────────────────────
  next: {
    label: 'Next.js',
    color: 'white',
    port: 3000,
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `create-next-app@latest ${name} --no-typescript --tailwind=false --eslint --app`) },
      ts:      { cmd: (pm, name) => pmExec(pm, `create-next-app@latest ${name} --typescript --tailwind=false --eslint --app`) },
    },
  },

  // ── Vue ────────────────────────────────────────────────
  vue: {
    label: 'Vue 3 (Vite)',
    color: 'green',
    port: 5173,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template vue`) },
      ts:      { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template vue-ts`) },
    },
  },

  // ── Svelte ─────────────────────────────────────────────
  svelte: {
    label: 'Svelte (Vite)',
    color: 'red',
    port: 5173,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template svelte`) },
      ts:      { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template svelte-ts`) },
    },
  },

  // ── SvelteKit ──────────────────────────────────────────
  sveltekit: {
    label: 'SvelteKit',
    color: 'red',
    port: 5173,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `svelte@latest ${name}`) },
    },
  },

  // ── Nuxt ──────────────────────────────────────────────
  nuxt: {
    label: 'Nuxt 3',
    color: 'green',
    port: 3000,
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `nuxi@latest init ${name}`) },
    },
  },

  // ── Remix ─────────────────────────────────────────────
  remix: {
    label: 'Remix',
    color: 'blue',
    port: 3000,
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `create-remix@latest ${name}`) },
    },
  },

  // ── Astro ─────────────────────────────────────────────
  astro: {
    label: 'Astro',
    color: 'magenta',
    port: 4321,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `astro@latest ${name}`) },
    },
  },

  // ── Node.js API ───────────────────────────────────────
  node: {
    label: 'Node.js + Express',
    color: 'yellow',
    port: 3000,
    variants: {
      default: { cmd: (pm, name) => null, custom: true },
    },
  },

  // ── Electron ──────────────────────────────────────────
  electron: {
    label: 'Electron (App bureau)',
    color: 'blue',
    port: null,
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `electron-vite@latest ${name}`) },
    },
  },
};

// Librairies populaires installables avec `bhil add`
export const POPULAR_LIBS = {
  'tailwind':      { pkg: 'tailwindcss postcss autoprefixer',    label: 'Tailwind CSS v3', dev: true },
  'router':        { pkg: 'react-router-dom',                    label: 'React Router' },
  'axios':         { pkg: 'axios',                               label: 'Axios' },
  'query':         { pkg: '@tanstack/react-query',               label: 'TanStack Query' },
  'zustand':       { pkg: 'zustand',                             label: 'Zustand' },
  'mui':           { pkg: '@mui/material @emotion/react @emotion/styled', label: 'Material UI' },
  // shadcn/ui nécessite une initialisation via CLI: npx shadcn@latest init
  // 'shadcn': non supporté via bhil add (utilise: npx shadcn@latest init)
  'framer':        { pkg: 'framer-motion',                       label: 'Framer Motion' },
  'zod':           { pkg: 'zod',                                 label: 'Zod' },
  'rhf':           { pkg: 'react-hook-form',                     label: 'React Hook Form' },
  'icons':         { pkg: 'lucide-react',                        label: 'Lucide Icons' },
  'recharts':      { pkg: 'recharts',                            label: 'Recharts' },
  'prisma':        { pkg: 'prisma @prisma/client',               label: 'Prisma ORM', dev: true },
  'supabase':      { pkg: '@supabase/supabase-js',               label: 'Supabase' },
  'firebase':      { pkg: 'firebase',                            label: 'Firebase' },
  'stripe':        { pkg: '@stripe/stripe-js stripe',            label: 'Stripe' },
  'auth':          { pkg: 'next-auth',                           label: 'NextAuth.js' },
};

// Helpers pour construire les commandes selon le gestionnaire
function pmCreate(pm, rest) {
  // Pour npm, pnpm et bun, on a besoin du -- pour passer les arguments au générateur (ex: vite)
  // Pour yarn, on doit retirer le séparateur "-- " mais GARDER les tirets des arguments (ex: --template)
  const map = { 
    npm: `npm create ${rest}`, 
    yarn: `yarn create ${rest.replace('-- ', '')}`, 
    pnpm: `pnpm create ${rest}`, 
    bun: `bun create ${rest}` 
  };
  return map[pm] || map.npm;
}

function pmExec(pm, rest) {
  const map = { npm: `npx ${rest}`, yarn: `yarn dlx ${rest}`, pnpm: `pnpm dlx ${rest}`, bun: `bunx ${rest}` };
  return map[pm] || map.npm;
}

export function detectPM() {
  // 1. Check environment variable (if run via a package manager)
  const agent = process.env.npm_config_user_agent;
  if (agent) {
    if (agent.includes('pnpm')) return 'pnpm';
    if (agent.includes('yarn')) return 'yarn';
    if (agent.includes('bun')) return 'bun';
    if (agent.includes('npm')) return 'npm';
  }

  // 2. Check package.json "packageManager" field
  try {
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (pkg.packageManager) {
        if (pkg.packageManager.startsWith('pnpm')) return 'pnpm';
        if (pkg.packageManager.startsWith('yarn')) return 'yarn';
        if (pkg.packageManager.startsWith('bun')) return 'bun';
        if (pkg.packageManager.startsWith('npm')) return 'npm';
      }
    }
  } catch (e) {
    // ignore error reading/parsing pkg
  }

  // 3. Check lockfiles
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('bun.lockb')) return 'bun';
  
  return null;
}

export function getInstallCmd(pm, pkgs) {
  const str = pkgs.join(' ');
  const map = { npm: `npm install ${str}`, yarn: `yarn add ${str}`, pnpm: `pnpm add ${str}`, bun: `bun add ${str}` };
  return map[pm] || map.npm;
}

export function getDevInstallCmd(pm, pkgs) {
  const str = pkgs.join(' ');
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
