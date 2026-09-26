# Article Citation Web Extension

A Chrome extension that will extract article information and generate MLA and AMA citations.

## Project status
Article metadata extraction was manually checked on a standalone Fox News article. MLA generation and copying have been manually checked with Fox News, CNN, and NBC examples. The latest version adds an MLA 9 / AMA 11 selector; AMA browser verification is pending. Individual live-blog updates are not supported.

## Load and test
1. Open `chrome://extensions`, enable Developer mode, and choose Load unpacked.
2. Select this repository folder. After code changes, click the extension's Reload button.
3. Open a news article and click Article Citation.
4. Compare each field against the article and correct it if needed.
5. Select MLA 9 or AMA 11, click Generate, review the result, and click Copy citation. Paste into a rich-text editor to check italics.
6. Edit a field: the old citation should disappear. Generate again to use the new values.

Missing fields display a “Not found” placeholder. Edits are temporary and reset when the popup closes. Live-page details describe the whole page, not individual updates. Extraction supports common JSON-LD and meta tags; it does not guarantee compatibility with every publisher. For formatting, dates accept YYYY-MM-DD (including ISO timestamps), YYYY-MM, or YYYY. Invalid dates require correction. Names default to last-word-as-family-name; use `Family, Given` for complex names, semicolons for multiple authors, and `{Organization Name}` for organizations. Always review name order. The access date is the current local date.

The `activeTab` and `scripting` permissions allow reading page metadata when you open the extension. It does not send page content to a server.

## Automated checks
With Node.js installed, run `node --test tests/*.test.cjs`. These tests cover metadata parsing, malformed JSON, missing dates, live updates, and selecting the current article. They do not replace browser testing.

## Planned features
- Extract article titles, authors, publication names, dates, and URLs.
- Let users review and correct extracted information.
- Generate MLA and AMA citations.
- Copy citations to the clipboard.

## First milestone
Create a popup that displays the current page’s title and URL, with a button to copy the URL.

## Development approach
This project uses AI-assisted development. I am directing the features, reviewing the implementation, and learning to test and debug the extension.

## Citation formatting and third-party code
Formatting uses bundled citeproc-js and Citation Style Language MLA 9 and AMA 11 styles. No server or AI call is required. See `vendor/README.md`, `vendor/LICENSE`, and `vendor/AGPL-3.0.txt` for dependency attribution and licensing. The browser export in citeproc-js has a small compatibility guard; its formatting logic is unchanged. These licenses apply to the bundled third-party materials; the project's own license has not yet been selected.

Scope: standalone online news articles, works-cited entries only. No automatic guarantee of source completeness, author-name parsing, or suitability for all source types. Citation output can preserve italics in rich-text editors; plain-text fallback requires restoring italics manually.

## AMA notes
AMA output is a single reference numbered 1; renumber it to its order of first citation in the paper. This extension does not manage a whole bibliography or insert in-text citations. Review title sentence case and proper nouns manually; the formatter preserves the supplied title. Switching styles clears the old citation. Author initials and author-count rules come from the bundled AMA 11 style. Publication and access dates are included when available.
