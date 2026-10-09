# Xinchang Wang · 王心畅

Academic homepage: https://ccandtt.github.io/

Uses the official al-folio styles and page structure as a portable static edition. English is the default language; click 中文 to switch to Chinese. Includes selected publications, education, a graduation photo, and the original CV download.

## Update the website

- `index.html`: English content with Chinese translations in `data-zh` attributes.
- `styles.css`: site-specific appearance and responsive layout.
- `app.js`: language switching, theme switching, and BibTeX controls.
- `assets/`: photo, paper figures, CV, and fonts.
- `vendor/`: unmodified official al-folio styles.

GitHub Pages publishes from the `main` branch root. `.nojekyll` allows this static edition to publish without a Jekyll build. Push updates to `main` to publish changes automatically.

For a local preview: `python3 -m http.server 8080`.

al-folio and Roboto licenses and source provenance are retained in this repository. This is a static edition, not a complete Jekyll source project.
