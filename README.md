# Article Citation Web Extension

A Chrome extension that will extract article information and generate MLA and AMA citations.

## Project status
The initial title/URL popup was manually tested. The next version adds editable author, publication, and publication-date fields using page metadata. This version still needs manual testing in Chrome, including the Fox News live-news example. Citation formatting is not implemented yet.

## Load and test
1. Open `chrome://extensions`, enable Developer mode, and choose Load unpacked.
2. Select this repository folder. After code changes, click the extension's Reload button.
3. Open a news article and click Article Citation.
4. Compare each field against the article, try editing a field, and test Copy URL.

Missing fields display a “Not found” placeholder. Edits are temporary and reset when the popup closes. Live-page details describe the whole page, not individual updates. Extraction supports common JSON-LD and meta tags; it does not guarantee compatibility with every publisher. Dates retain the source's representation until citation formatting is implemented.

The `activeTab` and `scripting` permissions allow reading page metadata when you open the extension. It does not send page content to a server.

## Automated checks
With Node.js installed, run `node --test tests/metadata.test.cjs`. These tests cover metadata parsing, malformed JSON, missing dates, live updates, and selecting the current article. They do not replace browser testing.

## Planned features
- Extract article titles, authors, publication names, dates, and URLs.
- Let users review and correct extracted information.
- Generate MLA and AMA citations.
- Copy citations to the clipboard.

## First milestone
Create a popup that displays the current page’s title and URL, with a button to copy the URL.

## Development approach
This project uses AI-assisted development. I am directing the features, reviewing the implementation, and learning to test and debug the extension.
