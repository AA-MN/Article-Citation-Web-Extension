// Convert reviewed form values into the citation processor's standard data format.
function citationItem(values, today = new Date()) {
  const title = values.title.trim();
  const publication = values.publication.trim();
  if (!title || !publication) throw new Error('Enter an article title and publication name.');
  let url;
  try { url = new URL(values.url.trim()); } catch { throw new Error('Enter a valid article URL.'); }
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Use an http or https article URL.');
  const item = { id: 'article', type: 'article-newspaper', title, 'container-title': publication, URL: url.href };
  const rawDate = values.published.trim();
  if (rawDate) {
    const match = rawDate.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?:T.*)?$/);
    if (!match) throw new Error('Use YYYY-MM-DD, YYYY-MM, or YYYY for the date, or leave it blank.');
    const parts = match.slice(1).filter(Boolean).map(Number);
    const [year, month = 1, day = 1] = parts;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (year < 1000 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('Check the publication date: it is not a valid calendar date.');
    item.issued = { 'date-parts': [parts] };
  }
  item.accessed = { 'date-parts': [[today.getFullYear(), today.getMonth() + 1, today.getDate()]] };
  const authors = values.author.split(';').map(name => name.trim()).filter(Boolean);
  if (authors.length) item.author = authors.map(name => {
    // Braces explicitly mark an organization or a name that must stay in order.
    if (name.startsWith('{') && name.endsWith('}')) return { literal: name.slice(1, -1).trim() };
    if (name.includes(',')) {
      const [family, ...given] = name.split(',');
      return { family: family.trim(), given: given.join(',').trim() };
    }
    const words = name.split(/\s+/);
    if (words.length === 1) return { literal: name };
    return { family: words.pop(), given: words.join(' ') };
  });
  return item;
}
function formatMLA(item, style, locale, output = 'html') {
  const processor = new CSL.Engine({ retrieveLocale: () => locale, retrieveItem: () => item }, style, 'en-US');
  processor.setOutputFormat(output);
  processor.updateItems([item.id]);
  return processor.makeBibliography()[1].join('').trim();
}
