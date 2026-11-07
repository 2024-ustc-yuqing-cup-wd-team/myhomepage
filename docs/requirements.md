# Requirements Analysis

**USTC MyHomePage** — 2024 USTC Yuqing Cup, Team 25

> Original submission: [`docs/archive/requirements-original.pdf`](archive/requirements-original.pdf)
>
> This is an English transcription of the Chinese submission document. The
> implemented product changed slightly during the post-competition cleanup; the
> differences are listed in [Design overview](design.md#8-post-competition-refactor).

## 1. About this document

This is the requirements analysis for “USTC MyHomePage” (科大个人主页), the entry
of the 25th team in the 2024 USTC Yuqing Cup campus software design competition.

## 2. Project overview

### 2.1 At a glance

| Item | Value |
| --- | --- |
| Project name | USTC MyHomePage (科大个人主页) |
| Developers | Team 25 of the 2024 Yuqing Cup (now “WD Team”) |
| Primary users | USTC undergraduates |
| Platform | Desktop web, self-hosted on a local network |
| Storage | Browser-only (originally cookies; now `localStorage`) |

### 2.2 Background

Students at USTC rely on several separate online platforms: the academic
portal, the university mail system, Blackboard, the 瀚海 teaching platform, the
library, and others. Switching between them costs time and attention, and the
mobile app already covers this need on phones — but on a desktop PC there was no
equivalent convenient entry point. A small, focused web tool that collects the
most-used links and a daily schedule in one place therefore has a clear use
case.

### 2.3 Goals

The project aims to provide:

- fast navigation to frequently used campus systems (academic portal, mail,
  teaching platform, …);
- convenient schedule management and information aggregation;
- a better desktop experience that reduces the time spent on routine tasks.

### 2.4 Users

- **Primary:** USTC students, especially undergraduates.
- **Secondary:** anyone who needs a bookmark launcher and a lightweight
  calendar; the two tools are general enough to be useful outside USTC.

## 3. Requirements

### 3.1 Overall

The site should let students reach common websites quickly and manage their
personal schedule efficiently, through a clean and simple interface.

### 3.2 Functional

Two core features are expected:

1. **Bookmark navigation** — quick access to frequently used websites.
2. **Schedule management** — creating, editing and viewing personal events.

## 4. Functional requirements

### 4.1 Bookmarks (module 1)

| No. | Feature | ID |
| --- | --- | --- |
| 1.1 | Manage bookmarks | 1.1 |
| 1.1.1 | Add a bookmark | 1.1.1 |
| 1.1.2 | Delete a bookmark | 1.1.2 |
| 1.2 | Open a bookmark in a new tab | 1.2.1 |

The bookmark module presents a compact grid of saved sites. Adding a URL stores
its URL and domain; deleting removes it. Selecting a bookmark opens the target
site.

### 4.2 Calendar (module 2)

| No. | Feature | ID |
| --- | --- | --- |
| 2.1 | Manage events | 2.1 |
| 2.1.1 | Create an event | 2.1.1 |
| 2.1.2 | Move or edit an event | 2.1.2 |
| 2.1.3 | Delete an event | 2.1.3 |
| 2.2 | Switch views | 2.2 |
| 2.2.1 | Month / week / day view | 2.2.1 |

The calendar module supports creating an event with a date, time and
description, editing it, and deleting it, and lets the user switch between
month, week and day views.

## 5. Data and privacy

- Data is stored in the browser; no database and no user account are required.
- Data never leaves the user's machine, so no personal schedule or bookmark
  information is exposed to the server.
- The repository contains no credentials. The optional IMAP example in the
  deployment repository reads its configuration from environment variables.

## 6. Post-competition notes

The requirements above are unchanged. The implementation was cleaned up in 2026:

- bookmarks and events are stored in `localStorage` instead of cookies, which
  removes the 4 KB cookie limit and the need to hand-roll cookie parsing;
- bookmarks are rendered with local colour-coded monograms instead of
  third-party favicon services, so the page works fully offline and makes no
  external requests;
- the UI uses plain CSS instead of Bootstrap + jQuery + Semantic UI, with a
  self-hosted typeface pair and automatic light/dark themes.
