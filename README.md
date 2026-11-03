# Essential Digital Literacy — Course Materials

Slides, handouts, and resources for the Tech Exchange Essential Digital Literacy course.

**Live site:** https://timothylrichardson.github.io/techexchange-class/

The site is published with GitHub Pages from the `main` branch. Anything merged to `main` goes live within a few minutes.

## What's in the repo

| File | What it is |
|---|---|
| `index.html` | Course home page, with links to everything below |
| `class-1.html` | Class 1 — Computer & Windows Essentials (Lectures 1–2) |
| `class-2.html` | Class 2 — Internet & Online Safety (Lectures 3–4) |
| `class-3.html` | Classes 3 & 4 — Communicate & Collaborate (Lectures 5–8) |
| `class-1-handout.pdf` | Handout for Classes 1 & 2 |
| `class-2-handout.pdf` | Handout for Classes 3 & 4 |
| `resources.html` | Free tools, shortcuts, and places to keep learning |
| `assets/deck.css`, `assets/deck.js` | Shared styling and slide controls for Classes 1 and 2 |
| `scripts/check-evergreen.py` | Automatic check for cohort details (see below) |

`class-3.html` carries its own styling and controls inside the page.

## Course structure

- 1 lecture = 1 hour: about 30 minutes of teaching, 15 of hands-on lab, 5 of checkpoint, and a 10-minute break
- 1 class = 2 lectures
- 15–20 slides and exactly one hands-on lab per lecture
- Instructor notes on every slide. Press `N` in the deck to show them.

## Keeping the materials evergreen

These materials are reused for every cohort, so nothing in them should tie the course to one group, date, or site.

**Leave out:**

- Calendar dates, days of the week, and years tied to a class
- Clock times, including schedules, break times, and return times
- Venues, room numbers, and partner-site names and addresses
- References that assume a schedule, such as "this morning," "on Tuesday," or "lunch at 12:40"

**Write this instead:**

| Instead of | Use |
|---|---|
| A clock time on an agenda | Hour 1, Hour 2 |
| `1:00–1:50` on a slide label | `50 min` |
| "Back at 2:00" | "Ten-minute break. Then Lecture 2." |
| "Lab launch by 2:30" | "Lab launch 30 minutes in." |
| "What you learned on Tuesday" | "What you learned in Class 1" |

**Keep:**

- Tech Exchange's own address, phone number, and email. These are how students reach us for help, not a class location.
- Facts with a date that matter on their own, such as the day Windows 10 support ended. These are listed in `ALLOWED` in `scripts/check-evergreen.py`.
- Relative words such as "today," which stay true at every session.

**Cohort logistics** (date, time, room, next-class details) belong in the welcome message, on the board, or spoken at the start of class. Past cohort details remain in the Git history.

Details are removed from the pages themselves, not hidden with CSS. Hidden text would still appear in the page source, in screen readers, and in search results.

### The automatic check

`scripts/check-evergreen.py` scans every HTML page and PDF for dates, times, and venues, including the created and modified dates in PDF file properties. It runs on every push through GitHub Actions. A red X on a commit means something needs fixing, and the Actions log lists the file and the text.

To run it yourself:

```
pip install pypdf
python3 scripts/check-evergreen.py
```

When a new cohort adds a partner site, add its name to the `room or venue` rule so the check also catches that site.

## Updating the handouts

The handouts have no editable source in this repo, so they are PDFs only. If you replace one, clear its created and modified dates before committing. The check will flag them if you don't.

## Branding

Follow the Tech Exchange brand assets at techexchange.org/brandassets: official full-color logo on light backgrounds, no distortion or cropping, Tech Exchange green `#99CC33` and ink `#231F20`.
