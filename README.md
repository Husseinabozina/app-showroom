# Hussein Abozina — Apps & Projects

**[Open the live showroom](https://husseinabozina.github.io/app-showroom/)**

A curated mobile product exhibition. Built as a portable, dependency-free static website with a structured project catalog. Content is evidence-led; public presentation repositories are never labeled as app source code.

## Development

Node.js 20+ and Python 3 are sufficient. Run `npm run build`, then `npm run dev` and open http://localhost:4173. Run `npm test` for catalog and generated-page validation.

## Content

Project records live in `content/projects.json`. Edit facts, screenshots, links, `visible`, `featured`, and `order`, then rebuild. See `docs/CONTENT.md` for the editorial contract and `docs/RESEARCH.md` for provenance and missing evidence.

## Publishing and continuation

Push to `main` to run validation and deploy to GitHub Pages. See `docs/HOSTING.md` for the complete workflow and `docs/QA.md` for browser verification.
