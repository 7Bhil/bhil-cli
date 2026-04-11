# bhil — ton gestionnaire de projets

Crée n'importe quel projet en quelques secondes, sans te souvenir des commandes.

## Installation

```bash
# Clone le projet
git clone https://github.com/bhilal/bhil.git
cd bhil

# Installe les dépendances
npm install

# Installe bhil globalement sur ta machine
npm install -g .
```

Maintenant tu peux taper `bhil` depuis n'importe où dans ton terminal !

---

## Utilisation

### Mode interactif (recommandé)
```bash
bhil create mon-app
```
bhil te pose des questions et configure tout.

### Mode rapide (une seule commande)
```bash
# React + Vite
bhil create mon-app --framework react

# Next.js + TypeScript + Tailwind
bhil create mon-app --framework next --ts --tailwind

# Vue 3 avec pnpm
bhil new mon-app --framework vue --pm pnpm

# Svelte
bhil create mon-app --framework svelte --ts
```

### Ajouter des librairies
```bash
# Avec des alias courts
bhil add axios
bhil add zustand icons router

# Ou le vrai nom npm
bhil add framer-motion @stripe/stripe-js
```

### Voir tous les templates
```bash
bhil list
```

---

## Frameworks supportés

| Alias       | Description              |
|-------------|--------------------------|
| `react`     | React + Vite             |
| `next`      | Next.js (App Router)     |
| `vue`       | Vue 3 + Vite             |
| `svelte`    | Svelte + Vite            |
| `sveltekit` | SvelteKit                |
| `nuxt`      | Nuxt 3                   |
| `remix`     | Remix                    |
| `astro`     | Astro                    |
| `node`      | Node.js (API)            |
| `electron`  | App bureau Electron      |

## Librairies rapides

| Alias      | Librairie             |
|------------|-----------------------|
| `tailwind` | Tailwind CSS          |
| `router`   | React Router          |
| `axios`    | Axios                 |
| `query`    | TanStack Query        |
| `zustand`  | Zustand               |
| `mui`      | Material UI           |
| `shadcn`   | shadcn/ui             |
| `framer`   | Framer Motion         |
| `zod`      | Zod                   |
| `rhf`      | React Hook Form       |
| `icons`    | Lucide React          |
| `recharts` | Recharts              |
| `prisma`   | Prisma ORM            |
| `supabase` | Supabase              |
| `firebase` | Firebase              |
| `stripe`   | Stripe                |
| `auth`     | NextAuth.js           |

---

## Ajouter tes propres templates

Ouvre `src/templates/registry.js` et ajoute ton framework dans `FRAMEWORKS` :

```js
monoutil: {
  label: 'Mon outil custom',
  color: 'yellow',
  variants: {
    default: { cmd: (pm, name) => `ma-commande ${name}` },
  },
},
```

C'est tout !
# bhil-cli
