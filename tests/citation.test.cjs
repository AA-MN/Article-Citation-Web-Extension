const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const context = vm.createContext({ URL, CSL: require('../vendor/citeproc.js') });
vm.runInContext(fs.readFileSync(path.join(root, 'citation.js'), 'utf8'), context);
const style = fs.readFileSync(path.join(root, 'vendor/mla.csl'), 'utf8');
const locale = fs.readFileSync(path.join(root, 'vendor/locales-en-US.xml'), 'utf8');
const base = { title: 'A Test Article', author: 'Jane Smith', publication: 'Example News', published: '2026-09-25T23:30:00-05:00', url: 'https://example.com/article' };
const item = values => context.citationItem({ ...base, ...values }, new Date(2026, 8, 26));
const format = values => context.formatMLA(item(values), style, locale, 'text');
test('MLA renders author, title, publication and original calendar date', () => {
  const text = format({});
  assert.match(text, /Smith, Jane/);
  assert.match(text, /“A Test Article\.”/);
  assert.match(text, /25 Sept\. 2026/);
  assert.match(text, /example.com\/article/);
});
test('missing author starts with the title; missing date includes access date', () => {
  const text = format({ author: '', published: '' });
  assert.match(text, /^“A Test Article/);
  assert.match(text, /Accessed 26 Sept\. 2026/);
  assert.doesNotMatch(text, /undefined|Invalid|n\.d\./);
});
test('organization names stay in order', () => {
  assert.match(format({ author: '{Example News Staff}' }), /^Example News Staff\./);
});
test('two authors and explicit family names', () => {
  assert.match(format({ author: 'de la Cruz, Maria; John Smith' }), /de la Cruz, Maria, and John Smith/);
});
test('invalid dates and unsafe URLs are rejected', () => {
  assert.throws(() => item({ published: '2026-02-30' }), /valid calendar/);
  assert.throws(() => item({ published: '09\/10\/2026' }), /YYYY/);
  assert.throws(() => item({ url: 'javascript:alert(1)' }), /http/);
  assert.throws(() => item({ title: '' }), /title/);
});
test('partial dates remain partial', () => {
  assert.equal(item({ published: '2026' }).issued['date-parts'][0].length, 1);
});
test('HTML output includes publication italics', () => {
  assert.match(context.formatMLA(item({}), style, locale), /<i>Example News<\/i>/);
});
