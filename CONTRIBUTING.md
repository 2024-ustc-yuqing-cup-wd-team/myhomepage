# Contributing

Thanks for taking a look at USTC MyHomePage. This repository is an archive of a
2024 competition entry, so it is **not under active development** — but small
fixes and documentation improvements are welcome.

## What is in scope

- Bug fixes in the site (HTML, CSS, JavaScript).
- Accessibility and responsive-layout improvements.
- Documentation fixes and translations.
- Build-free tooling that does not add runtime dependencies to the site.

New product features are out of scope.

## Local setup

There is no build step:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Run the repository checks before opening a pull request:

```bash
node scripts/check.mjs
```

## Style guide

- Keep the site dependency-free at runtime: no frameworks, no bundlers, no
  third-party network requests.
- Write plain, modern JavaScript (IIFE modules, `const`/`let`, no transpiler).
- Use semantic HTML and keep the existing CSS custom properties.
- 2-space indentation, UTF-8, LF line endings.
- Keep `scripts/check.mjs` green.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add keyboard shortcut to focus the bookmark input
fix: close the event dialog when pressing Escape
docs: correct the deployment path in README
chore: bump FullCalendar vendored build
```

## Pull requests

1. Describe what changed and why.
2. Include a screenshot for visible UI changes.
3. Confirm that `node scripts/check.mjs` passes.
4. Update the documentation when behaviour changes.

By contributing you agree that your changes are licensed under the
[MIT License](LICENSE) for code and [CC BY 4.0](LICENSE-docs) for
documentation.
