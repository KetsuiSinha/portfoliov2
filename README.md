# Nishchay Sinha — 3D Book Portfolio

This project has been migrated from a standalone HTML file to Next.js App Router and TypeScript. The original portfolio copy, book sections, 3D stack interaction, page tabs, image picker, and visual styling have been retained.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run typecheck
npm run lint
npm run build
```

## Project structure

- `app/` — App Router entry point, root layout, and global styles
- `components/portfolio-experience.tsx` — client-side 3D scene and reader interactions
- `components/book-reader.tsx` — typed reader, spread navigation, tabs, and page-turn interaction
- `lib/portfolio-data.tsx` — reusable typed content builders and book metadata

Edit existing portfolio text in `lib/portfolio-data.tsx`.
