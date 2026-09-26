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
