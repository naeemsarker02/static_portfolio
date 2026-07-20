# Development Guideline — Personal Portfolio Website

This document explains the full project so you can open any file, understand exactly why it looks the way it does, and edit/extend it yourself with full ownership. Read this once top to bottom before you start editing.

---

## 1. What this project is

A 5-page static personal portfolio website:

- `index.html` — Home
- `about.html` — About
- `portfolio.html` — Portfolio
- `service.html` — Service
- `contact.html` — Contact

It is **plain static HTML/CSS/JS** — no npm, no build step, no framework other than Bootstrap 5. The navbar and footer are loaded into every page via `fetch()` (see Section 4), so you **must** use a local server (VS Code's "Live Server" extension) rather than double-clicking the HTML file — browsers block `fetch()` on `file://` URLs.

---

## 2. Folder structure — what lives where

```
personal-portfolio/
│
├── index.html         Home page
├── about.html          About page
├── portfolio.html      Portfolio page
├── service.html        Service page
├── contact.html        Contact page
│
├── partials/
│   ├── header.html       The one and only copy of the navbar
│   └── footer.html       The one and only copy of the footer
│
├── css/
│   └── custom.css       All custom styling that Bootstrap doesn't already provide
│
├── js/
│   ├── include.js        Fetches header.html/footer.html and injects them into every page
│   ├── navbar.js         Highlights the current page's nav link
│   ├── footer.js         Live clock + copyright year in the footer
│   └── formValidation.js Validates the contact form (contact.html only)
│
├── assets/
│   ├── images/           Your real photos/certificates go here
│   └── icons/            Favicon or other small icons go here
│
├── README.md              Setup instructions + spec traceability matrix
└── development_guideline.md   This file
```

The navbar and footer are **centralized** in `partials/header.html` and `partials/footer.html` — there is exactly one copy of each in the whole project. Every page (`index.html`, `about.html`, etc.) only contains an empty `<div id="header-placeholder"></div>` and `<div id="footer-placeholder"></div>`; `js/include.js` fetches the two partial files and injects their HTML into those divs when the page loads. This is explained in full in Section 4.

---

## 3. What each page's `<head>` contains, and why

Open any page (e.g. `about.html`) and look at the top:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>About | My Portfolio</title>
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<link rel="stylesheet" href="css/custom.css">
<script type="application/ld+json"> ... </script>
```

| Line | Purpose |
|---|---|
| `charset`, `viewport` | Standard HTML5 boilerplate — makes the page render correctly and responsively on mobile. |
| `title`, `description`, `og:*` | SEO — every page has a **unique** title and description (search engines and social-media link previews use these). |
| Bootstrap CDN `<link>` | Pulls in Bootstrap 5's CSS from a CDN — this is what gives you `container`, `row`, `col-*`, `card`, `navbar`, `btn`, `table`, `modal`, `accordion`, `carousel`, etc. **No install needed.** |
| Font Awesome CDN `<link>` | Pulls in all the icon classes (`fa-solid fa-envelope`, etc.) used throughout the site. |
| `css/custom.css` | The **only** place custom CSS rules live (see Section 5). |
| JSON-LD `<script type="application/ld+json">` | Structured data for SEO (tells Google "this page is about a person named X who does Y"). This is the **one and only** inline `<script>` allowed in the whole project — it holds pure data, not logic, so it does not break the "no inline JS logic" rule. Everything else is in external `.js` files. |

At the bottom of `<body>`, every page loads:

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/include.js"></script>
<script src="js/navbar.js"></script>
<script src="js/footer.js"></script>
```

(`contact.html` additionally loads `js/formValidation.js`.)

The **Bootstrap JS bundle** is what makes the carousel, modal, accordion, and navbar hamburger actually work — you never had to write that JavaScript yourself, it comes from Bootstrap. `js/include.js` must load **before** `navbar.js` and `footer.js` since those two depend on the navbar/footer HTML already being in the page (see Section 4). Our own `.js` files only handle the four things Bootstrap can't do (see Section 6).

---

## 4. Navbar & Footer — centralized with `fetch()`, one copy each

Even without a build tool, plain vanilla JavaScript's built-in `fetch()` function can pull in an HTML file at runtime and inject it into the page. That's exactly what this project does, so the navbar and footer only need to be written **once** each, in `partials/header.html` and `partials/footer.html`.

**In every page's `<body>`**, instead of the full navbar/footer markup, you'll only find:

```html
<div id="header-placeholder"></div>

<main>
  ...
</main>

<div id="footer-placeholder"></div>
```

**`js/include.js`** is what fills those two empty divs in:

```js
function loadPartial(placeholderId, filePath) {
  return fetch(filePath)
    .then(function (response) {
      return response.text();
    })
    .then(function (html) {
      document.getElementById(placeholderId).innerHTML = html;
    });
}

Promise.all([
  loadPartial("header-placeholder", "partials/header.html"),
  loadPartial("footer-placeholder", "partials/footer.html")
]).then(function () {
  document.dispatchEvent(new Event("partialsLoaded"));
});
```

- `loadPartial(placeholderId, filePath)` fetches a partial HTML file as plain text, then writes that text into the placeholder `<div>` via `.innerHTML`. It returns the `fetch` promise so the caller can know when it's actually done (fetching a file over the network isn't instant).
- `Promise.all([...])` runs both fetches (header + footer) at the same time and waits until **both** finish.
- Once both are injected, we fire a custom event called `partialsLoaded` on the `document`. This is the signal other scripts wait for.

**Why `navbar.js` and `footer.js` had to change:** before centralizing, the navbar/footer HTML already existed in the page the instant the browser parsed it, so those scripts could run immediately. Now the navbar/footer HTML doesn't exist yet when the page first loads — it only appears after `include.js`'s `fetch()` calls finish, which takes a moment. So both `navbar.js` and `footer.js` now wrap their logic inside:

```js
document.addEventListener("partialsLoaded", function () {
  // now it's safe to look for #mainNavbar, .nav-link, #live-clock, etc.
});
```

This guarantees they only run *after* the navbar/footer markup actually exists in the DOM.

**The one-time cost:** because `fetch()` makes a real network request, the browser will refuse it entirely on a `file://` URL (opening the HTML file directly by double-click) — this is a browser security restriction, not a bug in this project. **You must view every page through a local server** (VS Code Live Server, or any `http-server`/`python -m http.server`) for the navbar/footer to appear. See the README's "How to run" section.

**The payoff:** if you want to add a new nav link, change the logo text, add a social icon, or update the footer's contact details, you now edit **exactly one file** (`partials/header.html` or `partials/footer.html`) and it updates on all 5 pages automatically. No more hunting through 5 files to keep them in sync.

- `navbar-expand-lg` (inside `partials/header.html`) — navbar is a horizontal bar on large screens, collapses into a hamburger button below the `lg` breakpoint (992px). This is what makes it responsive (`6.b` of the spec) with zero custom code — pure Bootstrap.
- `data-bs-toggle="collapse"` / `data-bs-target="#mainNavbar"` — Bootstrap's own JS bundle listens for this attribute and toggles the menu open/closed. You didn't write any JS for this.
- The footer has 3 columns (`col-md-4`) — brand blurb, contact info, social icons — plus a bottom bar with `<span id="copyright-year">` and `<span id="live-clock">`, both filled in by `js/footer.js`.

---

## 5. `css/custom.css` — every rule explained

This file only contains what Bootstrap's utility classes genuinely cannot do. Everything else in the site (layout, spacing, colors, cards, buttons, tables) is done with plain Bootstrap classes directly in the HTML (`container`, `row`, `col-md-4`, `card`, `btn btn-primary`, `table table-bordered`, etc.) — **not** custom CSS.

```css
body {
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1 0 auto;
}
```
Two things happening here:
- `font-family` sets the site-wide font. Bootstrap's default is a system font stack; this line overrides it.
- The `display: flex; flex-direction: column; min-height: 100vh;` on `body`, combined with `flex: 1 0 auto` on `main`, is the **sticky-footer layout**. `body`'s three children in order are `#header-placeholder`, `<main>`, `#footer-placeholder`. Without this rule, on a short page (like Contact) the footer would end up floating right under the content instead of pinned to the bottom of the browser window. With it, `main` always stretches to fill any leftover vertical space, pushing the footer down to the bottom of the viewport on every page — giving every page the same fixed layout regardless of how much content it has.

```css
.navbar-brand {
  font-weight: bold;
  color: #2563eb !important;
}
```
Makes the logo/site-name in the navbar bold and blue. `!important` is needed because Bootstrap's own `.navbar-brand` color rule would otherwise win.

```css
.nav-link:hover {
  color: #2563eb !important;
}

.nav-link.active {
  color: #2563eb !important;
  font-weight: bold;
}
```
Two separate rules:
- `:hover` — every nav link turns blue when you mouse over it (spec requirement 6.a — "mouse hover effects").
- `.active` — whichever link matches the current page gets permanently blue + bold. The `active` class itself is added by `js/navbar.js` at runtime (see Section 6), not written by hand in the HTML.

```css
footer { background-color: #212529; color: #cccccc; }
footer a { color: #cccccc; margin-right: 15px; font-size: 1.2rem; }
footer a:hover { color: #2563eb; }
```
Dark footer background with light gray text, and the social icon links (`<a><i class="fa-brands ..."></i></a>`) get spacing and a blue hover color.

**If you want to change the site's main color** (currently blue, `#2563eb`), search this file for `#2563eb` and replace every occurrence — there are 4 of them (brand, hover, active, footer hover). The Bootstrap "Primary" buttons/cards elsewhere use Bootstrap's own default blue, which is a *different* shade — if you want everything to match exactly, you'd need to override Bootstrap's `--bs-primary` CSS variable in this file too.

---

## 6. JavaScript — the 4 custom files, line by line

Remember: Bootstrap's own JS bundle already handles the **carousel**, **modal**, and **accordion** — you'll never see custom code for those anywhere in this project. Our own files only cover what Bootstrap can't do.

### `js/include.js` — loads the navbar/footer partials into every page

Explained in full in Section 4. In short: it `fetch()`es `partials/header.html` and `partials/footer.html`, injects each into its placeholder `<div>`, and fires a `partialsLoaded` event once both are in the DOM. This file must run before `navbar.js` and `footer.js`.

### `js/navbar.js` — highlight the current page's link

```js
document.addEventListener("partialsLoaded", function () {
  var currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "") {
    currentPage = "index.html";
  }

  var navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(function (link) {
    var linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });
});
```
- Everything is wrapped in `document.addEventListener("partialsLoaded", ...)` because the `.nav-link` elements don't exist in the page until `include.js` has injected `partials/header.html`. Without this wrapper, `document.querySelectorAll(".nav-link")` would run too early and find nothing.
- `window.location.pathname` gives the current URL path (e.g. `/about.html`). `.split("/").pop()` grabs just the filename (`about.html`).
- If the path is empty (can happen if the server serves `/` as the root), we default to `index.html`.
- We loop over every element with class `nav-link` and compare its `href` to the current filename. If it matches, we add the `.active` class — which is what `custom.css`'s `.nav-link.active` rule then styles blue and bold.

### `js/footer.js` — live clock + copyright year

```js
function updateClock() {
  var clockSpan = document.getElementById("live-clock");
  if (!clockSpan) return;
  var now = new Date();
  clockSpan.textContent = now.toLocaleString();
}

document.addEventListener("partialsLoaded", function () {
  var yearSpan = document.getElementById("copyright-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  updateClock();
  setInterval(updateClock, 1000);
});
```
- Same reasoning as `navbar.js`: `#copyright-year` and `#live-clock` only exist after `partials/footer.html` has been injected, so the year-fill and the `setInterval` are both started inside the `partialsLoaded` listener.
- `updateClock()` is declared as a standalone named function (not wrapped in the listener) purely so `setInterval(updateClock, 1000)` can keep calling it every second after the listener has already run once — it looks up `#live-clock` fresh every time it runs.
- Fills `#copyright-year` with the current year once, on load.
- `setInterval(updateClock, 1000)` re-runs that function every 1000ms (1 second), which is what makes the clock "live" and tick.

### `js/formValidation.js` — contact form validation (contact.html only)

```js
var contactForm = document.getElementById("contactForm");

if (contactForm) {
  var nameInput = document.getElementById("nameInput");
  var emailInput = document.getElementById("emailInput");
  var phoneInput = document.getElementById("phoneInput");
  var addressInput = document.getElementById("addressInput");
  var messageInput = document.getElementById("messageInput");
  var successAlert = document.getElementById("formSuccessAlert");

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var phonePattern = /^[0-9+\-\s]{7,15}$/;

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    ...
  });
}
```
- The `if (contactForm)` guard means this whole script does nothing on pages other than `contact.html` (since `#contactForm` only exists there) — even though the same `formValidation.js` file could technically be loaded everywhere, it's currently only linked on `contact.html`.
- `e.preventDefault()` stops the browser's normal form submission (which would reload the page / hit a server that doesn't exist), so we can handle it entirely in JavaScript.
- For each field, we check if it's valid:
  - Name/Address/Message: must not be empty after trimming whitespace.
  - Email: must match the `emailPattern` regex (something@something.something).
  - Phone: must match `phonePattern` (digits, spaces, `+`/`-`, 7 to 15 characters).
- Invalid fields get the Bootstrap class `is-invalid` added, which turns the input border red and reveals the matching `<div class="invalid-feedback">` message right below it (that's a built-in Bootstrap behavior — `is-invalid` + `invalid-feedback` work together automatically).
- If every field passes, we show `#formSuccessAlert` (a hidden Bootstrap alert box) and reset the form.
- **There is no backend.** Nothing is actually emailed or saved anywhere — this is front-end-only validation, exactly as the spec asked for ("no backend — placeholder for future backend wiring"). If you later want the form to really send messages, you'd need to add a `fetch()` call inside this `submit` handler pointing at a real backend endpoint (PHP, Node, Formspree, etc.) — that is future work, not part of this project.

---

## 7. Bootstrap components used, and where

| Bootstrap component | Used in | What it does |
|---|---|---|
| Carousel | `index.html` (`#bannerCarousel`) | 3-slide auto-playing banner with dots + prev/next arrows. All behavior comes from `data-bs-ride="carousel"` and `data-bs-slide-to`/`data-bs-slide` attributes — zero custom JS. |
| Modal | `portfolio.html` (`#certModal1/2/3`) | Clicking "View Certificate" opens a popup showing the full certificate image + issuer + date. Triggered purely by `data-bs-toggle="modal" data-bs-target="#certModal1"` on the button, and `data-bs-dismiss="modal"` on the close (X) button. |
| Accordion | `service.html` (`#faqAccordion`) | 5 FAQ questions, only one answer open at a time. `data-bs-parent="#faqAccordion"` on each panel is what enforces "only one open at once." |
| Navbar + Collapse | Every page | Responsive hamburger menu, explained in Section 4. |
| Cards | Every page | The boxy white panels used for services, testimonials, clients, certificates. |
| Tables | `about.html`, `portfolio.html` | Real `<table>` elements (not divs) for Skill Information, Personal Information, Education, and Working Experience — matches the spec's requirement to use tables for structured data. |
| Grid system | Every page | `container` / `row` / `col-md-4` etc. is what makes every section responsive — it rearranges from multi-column on desktop to stacked on mobile automatically. |

To learn any of these components more deeply, search "Bootstrap 5 [component name]" in the official docs (getbootstrap.com/docs/5.3) — every `data-bs-*` attribute you see in this project's HTML is documented there.

---

## 8. How to make common edits yourself

**Change your name, email, phone, or bio text**
Open `about.html` and `portfolio.html`, find the plain text/table rows and edit directly. For the footer's contact info, edit `partials/footer.html` — since it's centralized now, that one edit updates all 5 pages automatically.

**Real photos/certificates**
`assets/images/my_img.jpg` is already wired into the About Me photo on `index.html` and the Biography photo on `about.html`. `assets/images/certificate.png` is wired into all 3 certificate cards (and their modals) on `portfolio.html` — since only one real certificate file exists right now, all 3 cards show the same image with different labels. If you get more certificates, save each as a new file in `assets/images/` and point each card's `src` at its own file instead of reusing `certificate.png` three times.

The 3 Home page carousel banners still use `https://placehold.co/...` placeholder images since no real banner photos were provided — replace those `src` values with your own images in `assets/images/` whenever you have them.

**Add a new page (e.g. `blog.html`)**
1. Copy any existing page (e.g. `about.html`) as a starting template.
2. Update its `<title>`, `<meta name="description">`, and JSON-LD block.
3. Add a new `<li class="nav-item"><a class="nav-link" href="blog.html">Blog</a></li>` to `partials/header.html` — just **that one file**, since the navbar is centralized.
4. Replace the `<main>` content with your new page's sections.
5. Keep the `<div id="header-placeholder"></div>` / `<div id="footer-placeholder"></div>` divs and the same `<script>` tags (`include.js` before `navbar.js`/`footer.js`) at the bottom of `<body>` so the new page loads the shared navbar/footer too.

**Add a new FAQ question**
In `service.html`, copy one `<div class="accordion-item">...</div>` block, paste it before `</div>` (closing the accordion), give it a new unique `id` (e.g. `faq6`), and update `data-bs-target` / `id` / `data-bs-parent` references to match.

**Change the site's primary color**
See Section 5 — search and replace `#2563eb` in `css/custom.css`.

---

## 9. What NOT to do (keeps the project consistent)

- Don't add `style="..."` attributes — put styling in `css/custom.css` or use a Bootstrap utility class instead.
- Don't add `<script>...</script>` blocks with logic directly in an HTML file — put JS in a `.js` file under `js/` and link it with `<script src="...">`. The only inline `<script>` allowed is the JSON-LD block, which is pure data.
- Don't hand-roll a carousel/modal/accordion in JavaScript — Bootstrap already provides these; just use the `data-bs-*` attributes.
- Don't install npm packages or add a build step — this project is intentionally framework-free besides Bootstrap/Font Awesome CDN links, so anyone (including you, months from now) can open it and understand it with zero setup.
- Don't paste navbar/footer HTML back into individual pages — edit `partials/header.html` / `partials/footer.html` instead, that's the whole point of centralizing them.
- Don't open pages by double-clicking the HTML file — `fetch()` won't work over `file://`. Always go through a local server (Live Server, etc.).

---

## 10. Full technology list

| Tool | Version / Source | Purpose |
|---|---|---|
| HTML5 | — | Page structure |
| Bootstrap 5 | 5.3.3, via CDN | Responsive grid, components (navbar, carousel, modal, accordion, cards, tables, forms) |
| Font Awesome | 6.7.2, via CDN | Icons |
| Vanilla JavaScript (ES5/ES6 style, no framework) | — | Navbar highlighting, live clock, form validation |
| Google Maps Embed | iframe, no API key | Location map on Contact page |
| JSON-LD | Schema.org | SEO structured data |

No React, Vue, jQuery, Sass/Less, or any build tool is used anywhere in this project.
