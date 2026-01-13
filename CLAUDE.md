# DatePicker Project

@README.md

## Package Manager

Use `bun` for this project, not `pnpm` or `npm`.

## Project Direction

This started as a throwaway prototype but is being turned into a proper package:

1. **npm package**: Make the datepicker importable into other React projects
2. **Demo site**: A small site deployable via GitHub Pages to showcase the component

## Task List

- [x] Review datepicker for accessibility and tab navigation etc.
- [x] Create a demo page (in App.tsx) which shows the picker used in a variety of ways
- [x] Ensure the datepicker is robust and self-contained in various circumstances
- [x] Remove all unnecessary shadcn from this project
- [x] Simplify the rest of this project so it has the minimum required to contain a component and render a mini-demo with vite
- [x] Separate the DatePicker component into a structure where it can be imported as an NPM package and published to NPM
- [x] Set up GH Action to build the demo page and deploy to GitHub Pages
- [x] Set up release process for publishing to NPM via GH Action and GH releases
- [x] Final cleanup and README update

## Next Steps (Manual)

See `task-publishing.local.md` for setup instructions. Before first release:

1. Manually publish to npm: `npm publish --access public`
2. Configure Trusted Publisher on npmjs.com
3. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
