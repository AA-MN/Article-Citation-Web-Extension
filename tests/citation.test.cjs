/* SPDX-License-Identifier: AGPL-3.0-or-later */
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
const format = values => context.formatCitation(item(values), style, locale, 'text');
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
  assert.match(context.formatCitation(item({}), style, locale), /<i>Example News<\/i>/);
});

const amaStyle = fs.readFileSync(path.join(root, 'vendor/ama.csl'), 'utf8');
const ama = values => context.formatCitation(item(values), amaStyle, locale, 'text');
test('AMA formats initials, numbering, full publication and access dates', () => {
  const text = ama({ author: 'Rebecca Keegan', title: 'A study of NBC News' });
  assert.match(text, /^1\. Keegan R\./);
  assert.match(text, /September 25, 2026\./);
  assert.match(text, /Accessed September 26, 2026\./);
  assert.match(text, /A study of NBC News/);
  assert.doesNotMatch(text, /[“”]/);
});
test('AMA lists three authors instead of MLA et al', () => {
  const text = ama({ author: 'Lauren Fox; Patrick Svitek; Dianne Gallagher' });
  assert.match(text, /Fox L, Svitek P, Gallagher D/);
  assert.doesNotMatch(text, /et al/);
});
test('AMA shortens seven authors to the first three and et al', () => {
  assert.match(ama({ author: 'Amy One; Bob Two; Cal Three; Dan Four; Eve Five; Fay Six; Gus Seven' }), /One A, Two B, Three C, et al/);
});
test('AMA missing author and date retains title and access date', () => {
  const text = ama({ author: '', published: '' });
  assert.match(text, /^1\. A Test Article/);
  assert.match(text, /Accessed September 26, 2026/);
  assert.doesNotMatch(text, /undefined|Invalid/);
});
test('alternating styles does not reuse the previous formatting', () => {
  assert.match(format({}), /Smith, Jane/);
  assert.match(ama({}), /Smith J/);
  assert.match(format({}), /Smith, Jane/);
});
