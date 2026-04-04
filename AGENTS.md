# AI Agent Instructions

This file contains configuration and guidelines for AI coding assistants working in this repository.

## Allowed Shell Commands

When executing terminal commands, the following are permitted:

- `find` — searching for files and directories within the project
- `npm run` — running any script defined in `package.json`

## Project Overview

Bitcoin Revolution is a monorepo containing:

- `apps/api` — Express API serving Bitcoin price, market data, and blockchain info
- `apps/web` — Next.js web app with i18n (English + pt-BR), blog, and Bitcoin tools
- `packages/types` — Shared TypeScript types

## Common Commands

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS + ShadCN UI components
- **i18n**: next-intl (locales: `en`, `pt-BR`)
- **API**: Express.js (apps/api)
- **Language**: TypeScript throughout
