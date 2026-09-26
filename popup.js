const fields = Object.fromEntries(["title", "author", "publication", "published", "url"].map(key => [key, document.getElementById(key)]));
const copyButton = document.getElementById("copy-button");
const statusElement = document.getElementById("status");
const noticeElement = document.getElementById("notice");

async function loadCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url || !/^https?:/.test(tab.url)) {
      throw new Error("Please open a regular website, then try again.");
    }
    let data = { title: tab.title || "", url: tab.url };
    try {
      const [execution] = await chrome.scripting.executeScript({
        target: { tabId: tab.id }, func: extractArticleMetadata,
      });
      if (!execution?.result) throw new Error("No metadata returned.");
      data = execution.result;
      noticeElement.textContent = data.isLive
        ? "Live coverage: these details describe the whole page, not an individual update. Review the author and date carefully."
        : "Check these details against the article. Missing information is left blank for you to fill in.";
    } catch {
      noticeElement.textContent = "Chrome could not read this page’s metadata. You can still copy its URL or enter details yourself.";
    }
    for (const [key, input] of Object.entries(fields)) {
      input.value = data[key] || "";
      input.disabled = false;
    }
    copyButton.disabled = false;
    document.getElementById("generate-button").disabled = false;
  } catch (error) {
    statusElement.textContent = error.message || "Unable to read this page.";
  }
}

copyButton.addEventListener("click", async () => {
  try {
    const url = new URL(fields.url.value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    statusElement.textContent = "Enter a valid http or https URL first.";
    return;
  }
  try {
    await navigator.clipboard.writeText(fields.url.value);
    statusElement.textContent = "URL copied to clipboard.";
  } catch {
    statusElement.textContent = "Could not copy automatically. Select the URL and copy it manually.";
  }
});
loadCurrentPage();

const generateButton = document.getElementById('generate-button');
const copyCitationButton = document.getElementById('copy-citation');
const citationSection = document.getElementById('citation-section');
const citationOutput = document.getElementById('citation-output');
let citationText = '';
let citationHtml = '';
let citationAssets;
function clearCitation() {
  citationText = '';
  citationHtml = '';
  citationSection.hidden = true;
  copyCitationButton.disabled = true;
  statusElement.textContent = '';
}
for (const input of Object.values(fields)) input.addEventListener('input', clearCitation);

// Retain only simple formatting; never insert webpage-derived HTML directly.
function safeCitationMarkup(markup) {
  const parsed = new DOMParser().parseFromString(markup, 'text/html');
  function copy(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    const result = document.createElement(['I', 'EM', 'B', 'STRONG', 'DIV', 'SPAN'].includes(node.nodeName) ? node.nodeName.toLowerCase() : 'span');
    for (const child of node.childNodes) result.append(copy(child));
    return result;
  }
  const container = document.createElement('div');
  for (const child of parsed.body.childNodes) container.append(copy(child));
  return container;
}
generateButton.addEventListener('click', async () => {
  clearCitation();
  generateButton.disabled = true;
  // Disable editing during this short local operation to avoid stale output.
  for (const input of Object.values(fields)) input.disabled = true;
  try {
    const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value]));
    const item = citationItem(values);
    if (!citationAssets) citationAssets = Promise.all(['vendor/mla.csl', 'vendor/locales-en-US.xml'].map(async path => {
      const response = await fetch(chrome.runtime.getURL(path));
      if (!response.ok) throw new Error('Could not load the bundled citation style. Reload the extension.');
      return response.text();
    })).catch(error => { citationAssets = undefined; throw error; });
    const [style, locale] = await citationAssets;
    const markup = safeCitationMarkup(formatMLA(item, style, locale));
    citationOutput.replaceChildren(markup);
    citationHtml = markup.innerHTML;
    citationText = markup.textContent.trim();
    citationSection.hidden = false;
    copyCitationButton.disabled = false;
    statusElement.textContent = 'Review the author name order and citation before using it. Access date uses today’s date.';
  } catch (error) {
    statusElement.textContent = error.message || 'Unable to generate the citation.';
  } finally {
    generateButton.disabled = false;
    for (const input of Object.values(fields)) input.disabled = false;
  }
});
copyCitationButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/plain': new Blob([citationText], { type: 'text/plain' }),
      'text/html': new Blob([citationHtml], { type: 'text/html' }),
    })]);
    statusElement.textContent = 'Citation copied. Rich-text editors can preserve the italics.';
  } catch {
    try {
      await navigator.clipboard.writeText(citationText);
      statusElement.textContent = 'Copied as plain text. Restore publication-name italics in your document.';
    } catch { statusElement.textContent = 'Copy failed. Select the citation above and copy it manually.'; }
  }
});
