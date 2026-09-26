const titleElement = document.getElementById("page-title");
const urlElement = document.getElementById("page-url");
const copyButton = document.getElementById("copy-button");
const statusElement = document.getElementById("status");

let currentUrl = "";

async function loadCurrentPage() {
  try {
    // Read the active tab each time the popup opens, so details stay current.
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
      throw new Error("Page information is unavailable.");
    }

    const url = new URL(tab.url);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Please open a regular website, then try again.");
    }

    currentUrl = tab.url;
    // textContent treats page metadata as text, never as executable HTML.
    titleElement.textContent = tab.title || "Untitled page";
    urlElement.textContent = currentUrl;
    copyButton.disabled = false;
  } catch (error) {
    titleElement.textContent = "Page unavailable";
    urlElement.textContent = "—";
    statusElement.textContent = error.message || "Unable to read this page.";
  }
}

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentUrl);
    statusElement.textContent = "URL copied to clipboard.";
  } catch {
    statusElement.textContent = "Could not copy automatically. Select the URL above and copy it manually.";
  }
});

loadCurrentPage();
