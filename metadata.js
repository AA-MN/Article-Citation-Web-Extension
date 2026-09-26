// Runs inside the webpage, so this function must be self-contained.
function extractArticleMetadata() {
  const clean = value => typeof value === "string" ? value.trim() : "";
  const meta = (...keys) => {
    for (const key of keys) {
      for (const element of document.querySelectorAll("meta[name], meta[property]")) {
        if ([element.getAttribute("name"), element.getAttribute("property")].includes(key)) {
          const value = clean(element.getAttribute("content"));
          if (value) return value;
        }
      }
    }
    return "";
  };
  const nodes = [];
  function collect(value) {
    if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") {
      nodes.push(value);
      // Individual live updates must not become the overall page's author/date.
      if (value["@graph"]) collect(value["@graph"]);
      if (value.mainEntity && typeof value.mainEntity === "object") collect(value.mainEntity);
    }
  }
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try { collect(JSON.parse(script.textContent)); } catch { /* Try the remaining metadata. */ }
  }
  const types = node => [node["@type"]].flat().map(value => String(value).split(/[\/#]/).pop());
  const articles = nodes.filter(node => types(node).some(type => /^(NewsArticle|Article|BlogPosting|LiveBlogPosting|ReportageNewsArticle)$/.test(type)));
  const pageKey = value => {
    try { const url = new URL(value, location.href); return url.origin + url.pathname.replace(/\/$/, ""); }
    catch { return ""; }
  };
  const article = articles.find(node => [node.url, node.mainEntityOfPage?.["@id"], node["@id"]].some(url => typeof url === "string" && pageKey(url) === pageKey(location.href))) || articles[0] || {};
  const resolve = value => value && typeof value === "object" && value["@id"] ? nodes.find(node => node["@id"] === value["@id"] && node.name) || value : value;
  const names = value => [...new Set([value].flat().map(resolve).map(item => clean(typeof item === "string" ? item : item?.name)).filter(Boolean))].join("; ");
  return {
    title: clean(article.headline) || meta("og:title", "twitter:title") || document.title,
    author: names(article.author) || meta("author", "citation_author"),
    publication: names(article.publisher) || meta("og:site_name", "citation_journal_title"),
    // A modification date is not a publication date.
    published: clean(article.datePublished) || meta("article:published_time", "datePublished", "citation_publication_date"),
    url: location.href,
    isLive: types(article).includes("LiveBlogPosting") || location.pathname.includes("/live-news/"),
  };
}
