# bhil — ton gestionnaire de projets

Crée et configure n'importe quel projet en quelques secondes, sans te souvenir des commandes.

## Installation

```bash
# 1. Clone le projet
git clone https://github.com/7Bhil/bhil-cli.git
cd bhil-cli

# 2. Installe les dépendances (au choix)
npm install   # ou pnpm install, yarn install, bun install

# 3. Installe bhil globalement sur ta machine
npm install -g . # ou pnpm add -g ., yarn link
```

Maintenant tape `bhil` depuis n'importe où dans ton terminal !

---

## Utilisation

### Mode interactif (recommandé)
```bash
bhil create mon-app
```
bhil te pose des questions et configure tout automatiquement.

### Mode rapide (une seule commande)
```bash
# React + Vite
bhil create mon-app --framework react

# Next.js + TypeScript
bhil create mon-app --framework next --ts

# Vue 3 avec pnpm
bhil create mon-app --framework vue --pm pnpm

# Svelte + TypeScript + Tailwind
bhil create mon-app --framework svelte --ts --tailwind

# Node.js + Express
bhil create mon-app --framework node
```

### Ajouter des librairies
```bash
# Avec des alias courts
bhil add axios
bhil add zustand icons router

# Forcer l'installation en devDependencies
bhil add tailwind --dev

# Ou le vrai nom npm
bhil add framer-motion @stripe/stripe-js
```

> Les librairies marquées `[dev]` (Tailwind, Prisma) sont automatiquement installées en `devDependencies`.

### Voir tous les templates
```bash
bhil list
```

---

## Comportement automatique

Après chaque `bhil create` :
- ✅ Les dépendances sont installées automatiquement (`npm install`)
- ✅ Un repo git est initialisé avec un premier commit (`git init`)
- ✅ Si Tailwind est sélectionné, `tailwind.config.js` et `postcss.config.js` sont générés

---

## Frameworks supportés

| Alias       | Description              | Port dev |
|-------------|--------------------------|----------|
| `react`     | React + Vite             | 5173     |
| `next`      | Next.js (App Router)     | 3000     |
| `vue`       | Vue 3 + Vite             | 5173     |
| `svelte`    | Svelte + Vite            | 5173     |
| `sveltekit` | SvelteKit                | 5173     |
| `nuxt`      | Nuxt 3                   | 3000     |
| `remix`     | Remix                    | 3000     |
| `astro`     | Astro                    | 4321     |
| `node`      | Node.js + Express        | 3000     |
| `electron`  | App bureau Electron      | —        |

## Librairies rapides

| Alias      | Librairie             | Type  |
|------------|-----------------------|-------|
| `tailwind` | Tailwind CSS v3       | dev   |
| `router`   | React Router          | prod  |
| `axios`    | Axios                 | prod  |
| `query`    | TanStack Query        | prod  |
| `zustand`  | Zustand               | prod  |
| `mui`      | Material UI           | prod  |
| `framer`   | Framer Motion         | prod  |
| `zod`      | Zod                   | prod  |
| `rhf`      | React Hook Form       | prod  |
| `icons`    | Lucide React          | prod  |
| `recharts` | Recharts              | prod  |
| `prisma`   | Prisma ORM            | dev   |
| `supabase` | Supabase              | prod  |
| `firebase` | Firebase              | prod  |
| `stripe`   | Stripe                | prod  |
| `auth`     | NextAuth.js           | prod  |

> **shadcn/ui** : non supporté, utilise `npx shadcn@latest init` directement dans ton projet.

---

## Ajouter tes propres templates

Ouvre `src/templates/registry.js` et ajoute ton framework dans `FRAMEWORKS` :

```js
monoutil: {
  label: 'Mon outil custom',
  color: 'yellow',
  port: 8080,
  variants: {
    default: { cmd: (pm, name) => `ma-commande ${name}` },
  },
},
```
