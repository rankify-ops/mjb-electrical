# MJB Electrical Group

Landing page for [MJB Electrical Group](https://mjbelectricalgroup.com.au/) — licensed electricians serving Melbourne and regional Victoria.

Plain HTML/CSS/JS, no build step. Deployed via GitHub Pages.

## Structure

```
index.html        single-page landing site
assets/site.css   all styles (brand tokens at the top of the file)
assets/site.js    nav, mobile drawer, fade-ins, multi-step quote form
images/           logo, hero, category, team and section imagery
```

## Brand

Colours are sampled directly from the MJB logo:

| Token | Value | Use |
|---|---|---|
| `--accent` | `#c8551b` | primary CTA / links (logo orange, darkened for text contrast) |
| `--accent-mid` | `#d26123` | exact logo orange — icons, accents on dark |
| `--red` | `#b10707` | logo bolt red — urgency and emphasis |

Font: Inter. Design language matches the Prime Group Build site.

## Before this goes live

- [ ] **Quote form is not connected.** Paste MJB's Web3Forms access key into
      `data-access-key` on `#quote-form` in `index.html`. Until then the form
      shows a "call us" message rather than silently dropping leads.
- [ ] **Reviews section is commented out** (see the block above `#areas`).
      The source site loads reviews from a third-party widget, so no real review
      text was available to carry across. Add real Google reviews or re-embed
      the widget.
- [ ] **Suburb tags** in the Service Areas section are commented out pending a
      confirmed suburb list from MJB.
- [ ] **FAQ answers** were written from the services MJB lists — the source site
      renders its answers client-side, so they couldn't be copied. Worth a
      read-through by the client.
- [ ] No email address, ABN or REC licence number is published on the current
      site — add to the footer once supplied.
- [ ] Add analytics (GTM) if wanted.

## Local preview

```bash
npx serve .
```
