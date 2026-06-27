# MYSTIKS — Horror Journalism
> *Mitos dan Mistik tanpa drama*

A fictional paranormal journalism corporate website built with **XHTML 1.0 Transitional**, **CSS**, and **JavaScript** as a group assignment for **IML254: Introduction to Web Content Development** at Universiti Teknologi MARA (UiTM) Kedah, Sungai Petani Campus.

🔗 **Live site:** [mystikshorror.github.io](https://mystikshorror.github.io/)

---

> **DISCLAIMER:** This website is not the official website of any real company. Mystiks Media does not exist. This project was developed solely for the purpose of learning XHTML & CSS.

---

## About

Mystiks is a fictional bilingual (Malay & English) paranormal media outlet that investigates haunted locations, urban legends, and unexplained phenomena across Southeast Asia. The brand was inspired by the growing popularity of Malaysian and Indonesian horror media, and the site was designed to reflect that dark, atmospheric aesthetic.

The project was developed over 12 weeks following the **Website Development Life Cycle (WDLC)**: Planning → Analysis & Discussion → Prototyping & Review → Development & Testing → Release & SEO → Maintenance.

---

## Pages

| File | Description |
|---|---|
| `index.xhtml` | Homepage — bilingual welcome, video player, article teasers |
| `news.xhtml` | News listing — featured article card and story grid |
| `1162026a.xhtml` | Article — Burger Tophat × Mystiks collaboration |
| `1062026b.xhtml` | Article — Camping ghost encounter |
| `1062026c.xhtml` | Article — UITM students meet Cik Pon |
| `1062026d.xhtml` | Article — Zombie video school project |
| `962026a.xhtml` | Article — Lorry-struck goat apparition |
| `962026b.xhtml` | Article — Abadi Nan Jaya horror film review |
| `962026c.xhtml` | Article — "Lai Sap" train ghost |
| `teams.xhtml` | Meet the Team — in-universe staff persona cards |
| `merch.xhtml` | Merchandise — product grid with JS shopping cart |
| `payment.xhtml` | Payment — simulated checkout confirmation |
| `forum.xhtml` | Community Forum — Firebase-powered posts and replies |
| `contact.xhtml` | Contact Us — social links and embedded Google Form |
| `careers.xhtml` | Write With Us — contributor recruitment page |
| `tos.xhtml` | Terms of Service — bilingual legal clauses |
| `group.xhtml` | Assignment info — course details and group member page |

**Total: 17 XHTML pages** (meets the 15-page minimum requirement).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | XHTML 1.0 Transitional |
| Styling | External CSS (`style.css` + page-specific sheets) |
| Interactivity | Vanilla JavaScript (`scripts.js`, `forum.js`) |
| Database | Firebase Realtime Database (forum posts & replies) |
| Hosting | GitHub Pages |
| Editor | Notepad++, Visual Studio Code |

### CSS files

- `style.css` — shared rules (header, nav, footer, base typography)
- `article.css` — breadcrumb, byline, and article body layout
- `teams.css` — persona card grid
- `forum.css` — thread list, composer, modals
- `contact.css` — two-column contact layout
- `careers.css` — recruitment page layout

### JavaScript files

- `scripts.js` — Riddex video player, "Kisah Baharu" button interaction
- `forum.js` — Firebase integration, sign-in/register modals, category filter tabs, character counter, sort toggle

---

## Features

- **Bilingual content** — all major copy written in both Bahasa Malaysia and English
- **Custom video player** — Riddex Player (RZSY, 2026) plays the 4-second brand intro clip (`h1.mp4`)
- **Live community forum** — Firebase Realtime Database stores accounts, posts, replies, and upvotes; no server required
- **Shopping cart** — JavaScript-driven cart on the merchandise page with running total, linking through to a simulated payment page
- **Social sharing** — every article page has share links for X/Twitter and WhatsApp, plus a copy-link button
- **Article breadcrumbs** — `Home › News › Category` trail on every article page
- **In-universe team personas** — separate from the academic `group.xhtml` page; characters include NAS PENANG, ARIF, NENEK KEBAYAN, and RISK
- **SEO basics** — unique `<title>` and `<meta>` description/keywords on every page; semantic headings; descriptive link text
- **Disclaimer footer** — appears on every page as required by the assignment brief

---

## Group Members

| # | Name | Student ID | Role |
|---|---|---|---|
| 01 | Rizq Syahmi bin Muhammad Fuad | 2024295574 |
| 02 | Muhamad Nasrul bin Hussain | 2024620964 |
| 03 | Nurul Allissya Fhasihah binti Abdullah | 2024680488 |
| 04 | Nur 'Arifah binti Zulhelmi Ang | 2024644794 |

**Group:** KCDIM1444E  
**Lecturer:** Dr. Anum Shafeera binti Amdan  
**Submission date:** 1 July 2026

---

## Repository Structure

```
mystikshorror.github.io/
├── images/              # All images and icons
├── index.xhtml          # Homepage
├── news.xhtml           # News listing
├── 1162026a.xhtml       # Articles (7 total)
├── 1062026b.xhtml
├── 1062026c.xhtml
├── 1062026d.xhtml
├── 962026a.xhtml
├── 962026b.xhtml
├── 962026c.xhtml
├── teams.xhtml
├── merch.xhtml
├── payment.xhtml
├── forum.xhtml
├── contact.xhtml
├── careers.xhtml
├── tos.xhtml
├── group.xhtml
├── style.css            # Shared stylesheet
├── article.css
├── careers.css
├── contact.css
├── forum.css
├── teams.css
├── scripts.js           # Video player + UI interactions
├── forum.js             # Firebase forum logic
└── h1.mp4               # Brand intro video
```

---

## Recommended Viewing

- **Browser:** Google Chrome
- **Resolution:** 1920 × 1080
