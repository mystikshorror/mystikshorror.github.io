# Mobile Compatibility Fix — Mystiks Site
## What to do

### Step 1 — Upload `mobile.css`
Add the `mobile.css` file to the root of your repository (same folder as `index.xhtml`, `style.css`, etc).

---

### Step 2 — Edit every `.xhtml` file

You need to make **two additions** to the `<head>` of **every** `.xhtml` file.

#### A) Add the viewport meta tag
Right after this existing line:
```xml
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
```
Add:
```xml
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

#### B) Link `mobile.css`
After the existing `<link rel="stylesheet" ...>` line in each file, add:
```xml
<link rel="stylesheet" type="text/css" href="mobile.css" />
```

---

### Files to update and their existing stylesheet

| File | Existing CSS |
|------|-------------|
| `index.xhtml` | `article.css` |
| `news.xhtml` | `style.css` |
| `contact.xhtml` | `contact.css` |
| `careers.xhtml` | `careers.css` |
| `teams.xhtml` | `teams.css` |
| `forum.xhtml` | `forum.css` |
| `merch.xhtml` | *(check file)* |
| `tos.xhtml` | *(check file)* |
| `group.xhtml` | *(check file)* |
| `payment.xhtml` | *(check file)* |
| `962026a.xhtml` | *(check file)* |
| `962026b.xhtml` | *(check file)* |
| `962026c.xhtml` | *(check file)* |
| `1062026b.xhtml` | *(check file)* |
| `1062026c.xhtml` | *(check file)* |
| `1062026d.xhtml` | *(check file)* |
| `1162026a.xhtml` | *(check file)* |

---

### Example — what `index.xhtml` `<head>` should look like after the change:

```xml
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="keywords" content="horror journalism, paranormal news, ghosts, investigations, Mystiks" />
<meta name="description" content="Mystiks Horror Journalism Network" />
<meta name="author" content="Mystiks Media" />
<title>Mystiks | Mitos dan Mistik tanpa drama</title>
<link rel="stylesheet" type="text/css" href="article.css" />
<link rel="stylesheet" type="text/css" href="mobile.css" />
<link rel="icon" type="image/png" href="images/ico.png" />
<script type="text/javascript" src="scripts.js"></script>
</head>
```

---

### What `mobile.css` does

- **Viewport**: fixes the root cause of mobile zoom-out (the viewport meta tag, added to HTML)
- **Container**: removes fixed pixel widths so the page fits any screen
- **Header/banner**: caps the height, keeps the image covering it properly
- **Navigation**: becomes a horizontally-scrollable bar instead of overflowing
- **Article layout**: stacks the sidebar below the main content (instead of side-by-side)
- **News grid**: switches from multi-column to single column
- **Contact page**: stacks the form below the contact details
- **Teams / Merch pages**: collapses to 2-column (and 1-column on very small phones)
- **Images / videos / iframes**: all constrained to 100% width
- **Tables**: wrapped in horizontal scroll
- **Forms**: inputs/textareas stretch to full width
- **Footer**: text size reduced, centered

Everything uses `!important` to override the existing desktop-first CSS without needing to modify the original CSS files.
