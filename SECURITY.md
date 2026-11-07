# Security policy

## Supported versions

This repository is a static site archived after the 2024 USTC Yuqing Cup. Only
the latest `main` branch is maintained.

| Version | Supported |
| --- | --- |
| `main` | ✅ |
| older commits | ❌ |

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Use GitHub's private
vulnerability reporting:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the problem, the affected file or page, and, if possible, a minimal
   reproduction.

You can expect an initial response within a few days. This is a volunteer,
archived project, so please allow reasonable time for a fix.

## Scope

- The site has no back end in its GitHub Pages form; it stores data in the
  visitor's `localStorage` and makes no third-party requests.
- The optional Express service in the
  [`orangepi-server`](https://github.com/2024-ustc-yuqing-cup-wd-team/orangepi-server)
  repository exposes only `GET /api/health`.
- Reports about the vendored FullCalendar build should go to the
  [FullCalendar project](https://github.com/fullcalendar/fullcalendar/security);
  we will still update the vendored copy when a fix is published.

## Secrets

This repository must not contain credentials, tokens or private keys. If you
spot one, report it privately and do not copy it into an issue. Environment
configuration lives in `.env` files that are ignored by git; a template is
provided as `.env.example`.
