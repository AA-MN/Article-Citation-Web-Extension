const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../metadata.js'), 'utf8');
function extract(scripts = [], tags = [], path = '/article') {
  const context = {
    URL, location: { href: 'https://example.com' + path, pathname: path },
    document: {
      title: 'Browser title',
      querySelectorAll(selector) {
        return selector.startsWith('script')
          ? scripts.map(value => ({ textContent: typeof value === 'string' ? value : JSON.stringify(value) }))
          : tags.map(tag => ({ getAttribute: key => tag[key] ?? null }));
      },
    },
  };
  return vm.runInNewContext(source + '\nextractArticleMetadata()', context);
}
test('extracts multiple authors and resolves publisher references', () => {
  const result = extract([{ '@graph': [
    { '@type': 'NewsArticle', headline: 'Article', author: [{ name: 'A' }, { name: 'B' }], publisher: { '@id': '#publisher' }, datePublished: '2026-09-25' },
    { '@id': '#publisher', name: 'Example News' },
  ] }]);
  assert.equal(result.author, 'A; B');
  assert.equal(result.publication, 'Example News');
  assert.equal(result.published, '2026-09-25');
});
test('malformed JSON does not prevent metadata fallback', () => {
  const result = extract(['{broken'], [{ name: 'author', content: 'Writer' }, { property: 'og:title', content: 'Headline' }]);
  assert.equal(result.author, 'Writer');
  assert.equal(result.title, 'Headline');
});
test('missing publication date does not use modification date', () => {
  const result = extract([{ '@type': 'NewsArticle', dateModified: '2026-09-26' }]);
  assert.equal(result.published, '');
  assert.equal(result.author, '');
});
test('live updates do not supply page-level authors or dates', () => {
  const result = extract([{ '@type': 'LiveBlogPosting', headline: 'Coverage', liveBlogUpdate: [{ '@type': 'BlogPosting', author: { name: 'Update writer' }, datePublished: '2026-09-26' }] }], [], '/live-news/example');
  assert.equal(result.isLive, true);
  assert.equal(result.author, '');
  assert.equal(result.published, '');
});
test('prefers an article matching the current page URL', () => {
  const result = extract([
    { '@type': 'NewsArticle', headline: 'Related article', url: 'https://example.com/other' },
    { '@type': 'NewsArticle', headline: 'Current article', url: 'https://example.com/article' },
  ]);
  assert.equal(result.title, 'Current article');
});
