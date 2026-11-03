import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const plain = value => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
const section = (tag, className) => {
  const match = html.match(new RegExp('<' + tag + '[^>]*class="' + className + '"[^>]*>([\\s\\S]*?)</' + tag + '>'));
  assert.ok(match, className + ' must be rendered');
  return match[1];
};

test('the requested three skills are rendered in order', () => {
  const list = section('ul', 'skill-list');
  const items = [...list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(match => plain(match[1]));
  assert.deepEqual(items, ['TypeScript', 'React', 'Python']);
});

test('the table of contents keeps its three destinations without arrows or icons', () => {
  const nav = section('nav', 'section-links');
  assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(match => match[1]), ['#career', '#education', '#skills']);
  assert.doesNotMatch(nav, /<svg|data-icon|↓|ArrowDown/);
});

test('all approved career entries retain their chronology', () => {
  assert.deepEqual([...html.matchAll(/data-entry="([^"]+)"/g)].map(match => match[1]),
    ['nakagawa', 'gld', 'sansan', 'succeed', 'freelance', 'geeken', 'kadokawa']);
  const freelance = html.match(/<article[^>]*data-entry="freelance"[^>]*>([\s\S]*?)<\/article>/)?.[1];
  assert.ok(freelance);
  assert.match(freelance, /2025\.11/);
  assert.doesNotMatch(freelance, /2026\.11/);
  assert.match(html, /2029\.03/);
  assert.match(html, /卒業予定/);
});

test('contact, original mascot, and native disclosures are present', () => {
  assert.match(html, /href="mailto:yoh\.kaminaga@gmail\.com"/);
  assert.match(html, /src="\/images\/gipen-original\.jpg"/);
  assert.equal((html.match(/<details\b/g) || []).length, 3);
  assert.equal((html.match(/担当業務を見る/g) || []).length, 3);
  assert.equal((html.match(/担当業務を閉じる/g) || []).length, 3);
  assert.doesNotMatch(html, /<script\b/);
});

test('missing routes have a static 404 page', async () => {
  const notFound = await readFile(new URL('../dist/404.html', import.meta.url), 'utf8');
  assert.match(notFound, /ページが見つかりません/);
  assert.match(notFound, /href="\/"/);
});

