# DatePicker Project

@README.md

## Package Manager

Use `bun` for this project, not `pnpm` or `npm`.

## Project Direction

This started as a throwaway prototype but is being turned into a proper package:

1. **npm package**: Make the datepicker importable into other React projects
2. **Demo site**: A small site deployable via GitHub Pages to showcase the component

Neither of these are implemented yet — the component itself is complete and working.

## Task List

- [x] Review datepicker for accessibility and tab navigation etc.
- [x] Create a demo page (in App.tsx) which shows the picker used in avariety of ways:
- [ ] Ensure the datepicker is robust and self-contained in various curcumstances. Consider container queries, and isolating certain parts of the CSS so they aren't fucked by inheritance from external global CSS. We should think about when and where we want to do this though, because we probably do want this, if it's used in a site with a certain font, to inherit that font. There may be trade offs to decide here. 
- [ ] Remove all unnececarry shadcn form this project
- [ ] Simplify the rest of this project so it has the minimum required to contain a component and render a mini-demo with vite. Keep eslint and tsconfig and the like.
- [ ] Seperate the DatePicker component into a structure where it can be imported as an NPM package and published to NPM etc.
- [ ] Set up GH Action to build the demo page and deploy as Start exciting to GitHub pages.
- [ ] Set up release process uh for publishing to NPM via GH Action and GH releases?
- [ ] Final cleanup and README update etc.
