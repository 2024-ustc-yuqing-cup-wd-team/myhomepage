# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-11-07

Post-competition cleanup of the 2024 USTC Yuqing Cup entry.

### Added

- Bilingual README (`README.md`, `README.zh-CN.md`) with screenshots,
  architecture notes and a quick-start guide.
- Markdown versions of the requirements analysis and design overview, with the
  original Chinese PDFs archived under `docs/archive/`.
- `LICENSE` (MIT, source code) and `LICENSE-docs` (CC BY 4.0,
  documentation and images).
- GitHub issue templates, a pull request template and a CI workflow.
- `scripts/check.mjs`: dependency-free HTML structure, link, anchor and
  JavaScript syntax checks.
- A 404 page, favicon, repository banner, social preview card and real
  screenshots.
- Project documentation: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` and
  `SECURITY.md`.

### Changed

- Rebuilt the site as three standalone pages (`index`, `bookmarks`, `calendar`)
  instead of one page embedding two `<iframe>`s, and fixed the broken DOM in the
  original `index.html`.
- Replaced Bootstrap 4/5, jQuery and Semantic UI with hand-written CSS and
  vanilla JavaScript.
- Moved storage from hand-parsed cookies to versioned `localStorage` keys.
- Bookmark icons are now generated locally as colour-coded monograms, removing
  third-party favicon requests.
- Trimmed the vendored FullCalendar distribution to the minified global build
  and its license.
- Converted all source files to UTF-8 with LF line endings.
- Made the layout responsive and accessible (skip link, focus states, native
  `<dialog>`, reduced-motion support).
- Extracted the theme colour and content from inline styles into stylesheets.

### Removed

- Committed `node_modules/` (590 files) and the stale `package-lock.json`.
- A hard-coded mail account credential; the file was rewritten to read
  configuration from environment variables in the deployment repository.
- Obsolete AI-generated tutorial notes (`docs/help/`) and duplicated `.docx`
  copies of the submission documents.
- The `YQC_Website` git submodule pointer.

[1.0.0]: https://github.com/2024-ustc-yuqing-cup-wd-team/myhomepage/releases/tag/v1.0.0
