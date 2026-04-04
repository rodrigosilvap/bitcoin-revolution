# Setup Instructions

The project files are all created. Run the following commands to get started:

## 1. Install dependencies
```bash
cd bitcoin-revolution
npm install
```

## 2. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 3. Optional: Replace stub UI components with official ShadCN

The `src/components/ui/` directory contains functional implementations of ShadCN components.
You can optionally replace them with the official ShadCN CLI versions for additional features:

```bash
npx shadcn@latest init
npx shadcn@latest add button card input select badge tabs alert skeleton separator label sheet dropdown-menu
```

## 4. Build for production
```bash
npm run build
npm start
```

---

## Project Structure

```
bitcoin-revolution/
├── messages/                  # i18n JSON files (EN + pt-BR)
├── public/images/             # Copied from original project
├── src/
│   ├── app/
│   │   ├── [locale]/          # All pages (locale-aware)
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── blog/          # Blog listing + post pages
│   │   │   └── tools/         # All 6 tool pages
│   │   └── api/bitcoin/       # Route handlers (price, market-data, etc.)
│   ├── components/
│   │   ├── layout/            # Header, Footer, ThemeToggle, LanguageSwitch
│   │   ├── home/              # Homepage sections
│   │   ├── blog/              # BlogPostCard, BlogPostContent
│   │   ├── tools/             # All 6 tool components
│   │   └── ui/                # ShadCN-compatible UI primitives
│   ├── content/blog/          # Markdown articles (YAML frontmatter)
│   │   ├── en/
│   │   └── pt-BR/
│   ├── data/
│   │   └── bip39-wordlist.json
│   ├── lib/
│   │   ├── blog.ts            # gray-matter + remark helpers
│   │   ├── address-validator.ts
│   │   ├── utils.ts
│   │   └── services/
│   │       ├── bitcoin-service.ts
│   │       └── halving-service.ts
│   ├── i18n.ts
│   └── middleware.ts
```
