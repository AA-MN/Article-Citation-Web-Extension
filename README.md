# Article Citation Helper

A Chrome extension that reads article metadata, lets you correct it, and generates MLA 9 or AMA 11 references. Formatting runs locally, without an AI API or backend server.

## Features
- Extract article titles, authors, publication names, publication dates, and URLs from common JSON-LD and meta tags.
- Review and edit extracted fields before formatting.
- Generate an MLA works-cited entry or an AMA reference.
- Copy formatted citations, with a plain-text fallback.
- Clear stale citations when a field or style changes.
- Flag live coverage so page-level metadata is not mistaken for an individual update.

## Install locally
This project is not currently distributed through the Chrome Web Store.

1. Clone the repository or download and extract its ZIP.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** and click **Load unpacked**.
4. Select the folder containing `manifest.json`.
5. Open a standalone news article, then choose **Article Citation Helper** from Chrome's extensions menu.

No package installation or build step is needed to run the extension. After changing files, reload the extension on `chrome://extensions` and reopen the popup.

## Use
1. Compare the extracted fields with the article and correct them if needed.
2. Choose **MLA 9** or **AMA 11** and click **Generate**.
3. Review the result, then click **Copy citation**.
4. Paste into a rich-text editor to preserve formatting when supported. Plain-text copying does not preserve italics.

Dates accept `YYYY-MM-DD`, ISO timestamps, `YYYY-MM`, or `YYYY`. Leave unknown dates blank. Separate authors with semicolons. For complex names, use `Family, Given`; wrap an organization in braces, such as `{Fox News Staff}`. Review inferred family names before use.

## Scope and limitations
- First version for standalone online news articles, not a universal citation generator.
- Missing fields show a “Not found” placeholder. Website metadata can be missing, inaccurate, or inconsistent.
- Live-page details describe the whole page; selecting individual updates is not supported.
- Name parsing defaults to treating the last word as the family name and can require correction.
- AMA titles need manual review for sentence case and proper nouns. Every standalone AMA reference starts at 1; renumber it to its order of first citation in your paper.
- Access dates use the current local date. The extension does not track earlier visits or accept a separate access date.
- Edits and generated citations reset when the popup closes. No saved library, bibliography management, or in-text citation insertion is provided.
- Browser-internal pages and some protected pages cannot be inspected.

## Privacy and permissions
`activeTab` grants temporary access to the current page when the extension is invoked. `scripting` lets it read page metadata. Page data is processed locally; the extension does not send it to a server, use analytics, or persist it in browser storage. Copy buttons write to your system clipboard only when clicked. Citation styles and the formatting library are bundled locally.

## Validation
- 17 automated tests cover extraction and formatting, including malformed metadata, missing dates, multiple authors, live updates, invalid input, and switching citation styles.
- User-reported manual checks covered MLA extraction/generation/copying on one Fox News, one CNN, and one NBC article, plus AMA generation/copying on the Fox News article.
- These examples do not establish complete compatibility with any publisher. Full browser automation is not yet included.

With Node.js installed, run:

```sh
node --test tests/*.test.cjs
```

## How the code is organized
| File | Purpose |
| --- | --- |
| `manifest.json` | Extension configuration and permissions |
| `popup.html` / `popup.css` | Popup structure and appearance |
| `popup.js` | Browser interaction, form events, display, and copying |
| `metadata.js` | Webpage metadata extraction |
| `citation.js` | Convert reviewed fields to CSL data and invoke the formatter |
| `vendor/` | Bundled formatter, citation styles, locale, and license notices |
| `tests/` | Automated extraction and formatting checks |

## Development approach
This project was built with substantial AI-generated code and AI-assisted debugging. The developer directed the features, manually tested example articles, and is learning the implementation through guided code walkthroughs.

## License
Article Citation Helper is licensed under the **GNU Affero General Public License, version 3 or (at your option) any later version** (`AGPL-3.0-or-later`). See [LICENSE](LICENSE).

You may use, study, modify, and share it under that license. It is provided without warranty. Preserve applicable notices and provide corresponding source when required by the license, including its provisions for modified software used over a network.

Third-party components retain their notices and licenses:

- **citeproc-js 2.4.63**, copyright Frank Bennett, offers CPAL or AGPL licensing in its bundled notice; this project uses its AGPL option. See `vendor/LICENSE` and `vendor/AGPL-3.0.txt`. The only local modification guards its CommonJS export for browser use (26 September 2026).
- **CSL MLA 9 and AMA 11 styles and the English locale** retain their contributors and CC BY-SA 3.0 notices in the XML files. See `vendor/README.md` for upstream sources.

The CSL data files retain their CC BY-SA 3.0 licensing; they are not relicensed by the project license.
