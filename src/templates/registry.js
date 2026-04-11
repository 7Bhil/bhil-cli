// Registre de tous les templates supportés par bhil
// Tu peux en ajouter facilement ici !

export const FRAMEWORKS = {
  // ── React ──────────────────────────────────────────────
  react: {
    label: 'React (Vite)',
    color: 'cyan',
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template react`) },
      ts:      { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template react-ts`) },
    },
  },

  // ── Next.js ────────────────────────────────────────────
  next: {
    label: 'Next.js',
    color: 'white',
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `create-next-app@latest ${name} --no-typescript --tailwind=false --eslint --app`) },
      ts:      { cmd: (pm, name) => pmExec(pm, `create-next-app@latest ${name} --typescript --tailwind=false --eslint --app`) },
    },
  },

  // ── Vue ────────────────────────────────────────────────
  vue: {
    label: 'Vue 3 (Vite)',
    color: 'green',
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template vue`) },
      ts:      { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template vue-ts`) },
    },
  },

  // ── Svelte ─────────────────────────────────────────────
  svelte: {
    label: 'Svelte (Vite)',
    color: 'red',
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template svelte`) },
      ts:      { cmd: (pm, name) => pmCreate(pm, `vite@latest ${name} -- --template svelte-ts`) },
    },
  },

  // ── SvelteKit ──────────────────────────────────────────
  sveltekit: {
    label: 'SvelteKit',
    color: 'red',
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `svelte@latest ${name}`) },
    },
  },

  // ── Nuxt ──────────────────────────────────────────────
  nuxt: {
    label: 'Nuxt 3',
    color: 'green',
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `nuxi@latest init ${name}`) },
    },
  },

  // ── Remix ─────────────────────────────────────────────
  remix: {
    label: 'Remix',
    color: 'blue',
    variants: {
      default: { cmd: (pm, name) => pmExec(pm, `create-remix@latest ${name}`) },
    },
  },

  // ── Astro ─────────────────────────────────────────────
  astro: {
    label: 'Astro',
    color: 'magenta',
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `astro@latest ${name}`) },
    },
  },

  // ── Node.js API ───────────────────────────────────────
  node: {
    label: 'Node.js (API Express)',
    color: 'yellow',
    variants: {
      default: { cmd: (pm, name) => null, custom: true },
    },
  },

  // ── Electron ──────────────────────────────────────────
  electron: {
    label: 'Electron (App bureau)',
    color: 'blue',
    variants: {
      default: { cmd: (pm, name) => pmCreate(pm, `electron-vite@latest ${name}`) },
    },
  },
};

// Librairies populaires installables avec `bhil add`
export const POPULAR_LIBS = {
  'tailwind':      { pkg: 'tailwindcss @tailwindcss/vite',      label: 'Tailwind CSS' },
  'router':        { pkg: 'react-router-dom',                    label: 'React Router' },
  'axios':         { pkg: 'axios',                               label: 'Axios' },
  'query':         { pkg: '@tanstack/react-query',               label: 'TanStack Query' },
  'zustand':       { pkg: 'zustand',                             label: 'Zustand' },
  'mui':           { pkg: '@mui/material @emotion/react @emotion/styled', label: 'Material UI' },
  'shadcn':        { pkg: 'shadcn',                              label: 'shadcn/ui' },
  'framer':        { pkg: 'framer-motion',                       label: 'Framer Motion' },
  'zod':           { pkg: 'zod',                                 label: 'Zod' },
  'rhf':           { pkg: 'react-hook-form',                     label: 'React Hook Form' },
  'icons':         { pkg: 'lucide-react',                        label: 'Lucide Icons' },
  'recharts':      { pkg: 'recharts',                            label: 'Recharts' },
  'prisma':        { pkg: 'prisma @prisma/client',               label: 'Prisma ORM' },
  'supabase':      { pkg: '@supabase/supabase-js',               label: 'Supabase' },
  'firebase':      { pkg: 'firebase',                            label: 'Firebase' },
  'stripe':        { pkg: '@stripe/stripe-js stripe',            label: 'Stripe' },
  'auth':          { pkg: 'next-auth',                           label: 'NextAuth.js' },
};

// Helpers pour construire les commandes selon le gestionnaire
function pmCreate(pm, rest) {
  const map = { npm: `npm create ${rest}`, yarn: `yarn create ${rest}`, pnpm: `pnpm create ${rest}`, bun: `bun create ${rest}` };
  return map[pm] || map.npm;
}

function pmExec(pm, rest) {
  const map = { npm: `npx ${rest}`, yarn: `yarn dlx ${rest}`, pnpm: `pnpm dlx ${rest}`, bun: `bunx ${rest}` };
  return map[pm] || map.npm;
}

export function getInstallCmd(pm, pkgs) {
  const str = pkgs.join(' ');
  const map = { npm: `npm install ${str}`, yarn: `yarn add ${str}`, pnpm: `pnpm add ${str}`, bun: `bun add ${str}` };
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
