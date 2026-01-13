# DatePicker Project

@README.md

## Package Manager

Use `bun` for this project, not `pnpm` or `npm`.

## Project Structure

- `lib/` — Component source code (published to npm as `@dannysmith/datepicker`)
- `src/` — Demo site source (deployed to GitHub Pages)
- `dist-lib/` — Library build output (git-ignored)
- `dist/` — Demo site build output (git-ignored)

## Scripts

```bash
bun run dev          # Run demo site locally
bun run build:lib    # Build npm package → dist-lib/
bun run build:demo   # Build demo site → dist/
bun run build        # Build both
```

## Releasing to npm

Run the release script:

```bash
./scripts/release.sh
```

This will:
1. Run lint and build checks
2. Prompt for new version number
3. Update package.json
4. Create a signed git tag
5. Push to GitHub

Pushing the tag triggers the GitHub Action (`.github/workflows/publish.yml`) which publishes to npm using OIDC Trusted Publishing (no secrets needed).

## Demo Site Deployment

The demo site auto-deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy-demo.yml`.

Live at: https://dannysmith.github.io/datepicker-danny

## Build Tools

- **tsup** — Builds the library (ESM, CJS, TypeScript declarations)
- **Vite** — Builds the demo site
- **tsconfig.lib.json** — TypeScript config for library build
