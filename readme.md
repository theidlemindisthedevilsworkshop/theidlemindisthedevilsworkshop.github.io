```md
# The Idle Mind Is the Devil’s Workshop

A deadpan, single-purpose website that turns procrastination into ritual.

No frameworks. No build step. No tracking. No excuses.

---

## What this is

This is a static HTML/CSS/JS site built like an “institution”:

- anonymous voice
- minimal navigation
- interactive pages that satirize avoidance without becoming self-help

It is designed to feel vivid and alive using only:

- HTML
- CSS
- vanilla JavaScript

---

## Features

- **Marginalia system**: floating commentary that reacts to idleness, motion, and tab switching
- **Confessional**: local-only confession feed (stored in `localStorage`)
- **Devil’s Timesheet**: generates a fake audit log and supports copy-to-clipboard
- **Absolution Lottery**: deterministic daily lottery (local seed)
- **Diagnostic**: lightweight quiz that returns archetypes
- **Vivid UI**: grain overlay, glow tracking, reveal animations, cursor dot, sweep highlights
- **No server**: everything runs client-side

---

## Pages

- `index.html` — home
- `workshop.html` — course catalog
- `confessional.html` — write + burn confessions (local)
- `timesheet.html` — generate timesheet
- `lottery.html` — daily absolution lottery
- `diagnostic.html` — loafter archetype test
- `about.html` — meta context
- `contact.html` — placeholders (no real contact)
- `404.html` — themed 404 page

---

## Project structure

```

/
index.html
workshop.html
confessional.html
timesheet.html
lottery.html
diagnostic.html
about.html
contact.html
404.html
robots.txt
sitemap.xml
.nojekyll

/assets
style.css
script.js
favicon.svg

````

---

## Local development

Option A: open directly:

```bash
open index.html
````

Option B: use a tiny local server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## Notes / constraints

* Confessional content is stored in browser `localStorage`.
  It does not sync across devices.
* Sound is optional and off by default (toggled in UI).
* No analytics by design.
* No dependency chain.

---

## License

* Unlicense

---

If you want to add new pages, keep the tone:

Institutional. Precise. Deadpan. Allergic to motivation-speak.
