# Hosting and continuation

The active hosting target is GitHub Pages:

https://husseinabozina.github.io/app-showroom/

Pushing to `main` runs `.github/workflows/pages.yml`: build → content/link validation → generated-output consistency check → upload → deploy. Pull requests also run the quality workflow. No personal deployment credentials are stored in this repository.

## Continue from another computer

1. Clone `https://github.com/Husseinabozina/app-showroom.git`.
2. Use Node.js 20+ and Python 3; no package installation is required.
3. Edit `content/projects.json`, images, CSS or templates.
4. Run `npm run build` and `npm test`.
5. Run `npm run dev` to inspect the site at http://localhost:4173.
6. Commit content/source and regenerated `dist` together; push to `main`.
7. Confirm the Publish showroom workflow passes.

Relative asset and project links support GitHub Pages' repository subpath. Styles and scripts use content-versioned URLs so browser caches do not retain stale versions after an update.

## Initial hosting attempt

Sites registration originally returned `appgprj_6ac4133699a88191908b09abdb8879bc`. Subsequent credential refresh and `get_site` calls both returned `project_not_found`, so no Sites deployment succeeded. The unused Sites manifest was removed to avoid misrouting future edits. The repository and public site use GitHub Pages instead. Do not claim the original Sites URL is live.
