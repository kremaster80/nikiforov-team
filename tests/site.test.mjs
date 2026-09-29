import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const html = read('index.html');
const cookie = read('cookie-consent.js');
const aqua = read('aqua-overrides.css');

test('Telegram: navigation and intro copy are exact', () => {
  assert.match(html, /<a href="#questions">Проект<\/a>/);
  assert.match(html, /<h2>Направления работы<br><span>в проекте<\/span><\/h2>/);
  assert.match(html, /01 \/ ЦЕЛИ/);
  assert.match(html, /<h2>Тарифы индивидуального<br><span>ведения с тренером<\/span><\/h2>/);
  assert.match(html, /Листайте карточки вправо\. Для каждой задачи будет собственный кейс «до \/ после»\./);
  assert.doesNotMatch(html, /отдельная точка входа в проект/i);
});

test('Telegram: all seven goal cards have the approved wording', () => {
  const matches = [...html.matchAll(/<article class="goal">([\s\S]*?)<\/article>/g)];
  assert.equal(matches.length, 7);
  const required = [
    ['Желаете похудеть', 'без жёстких ограничений'],
    ['Набрать мышечную массу', 'питание и восстановление для вашего максимального прогресса'],
    ['Улучшить пропорции и качество тела', 'рекомпозиции с сохранением мышечной массы'],
    ['Научиться правильно тренироваться', 'усвоении технических нюансов'],
    ['Разобраться с питанием', 'Тонкости питания и подсчёта КБЖУ'],
    ['Перебороть плато', 'с учётом анатомических особенностей'],
    ['Подготовиться к сцене', 'соревнованиях по бодибилдингу']
  ];
  for (let i = 0; i < required.length; i++) {
    assert.ok(matches[i][1].includes('<h3>' + required[i][0] + '</h3>'), 'Card ' + (i + 1) + ' title');
    assert.ok(matches[i][1].includes(required[i][1]), 'Card ' + (i + 1) + ' text');
    assert.ok(matches[i][1].includes('https://t.me/OZNikiforovTeam'), 'Card ' + (i + 1) + ' CTA');
  }
});

test('Telegram: tariff labels and description match the requested edits', () => {
  assert.match(html, /<h3>Полный формат<\/h3>/);
  assert.match(html, /<h3>Самостоятельный формат<\/h3>/);
  assert.match(html, /Основа проекта одна\. Отличия в плотности контакта с тренером и в частоте разбора технических нюансов\./);
  assert.doesNotMatch(html, /глубина постоянного контроля/);
});

test('Cookie: banner, choice controls, settings and policy links are integrated', () => {
  assert.match(html, /data-cookie-banner hidden/);
  assert.match(html, /data-cookie-choice="accept"/);
  assert.match(html, /data-cookie-choice="reject"/);
  assert.match(html, /data-cookie-settings/);
  assert.match(html, /src="\.\/cookie-consent\.js"/);
  for (const page of ['privacy.html', 'consent.html', 'cookies.html']) {
    assert.ok(html.includes('href="./' + page + '"'));
    assert.ok(read(page).includes('Вернуться на Nikiforov Team'));
  }
});

test('Cookie: analytics stays disabled until user approval and real counter ID', () => {
  assert.match(cookie, /const METRIKA_ID = "PASTE_METRIKA_COUNTER_ID"/);
  assert.match(cookie, /if \(metrikaStarted \|\| !\/\^\\d\{5,12\}\$\/\.test\(METRIKA_ID\)\) return/);
  assert.match(cookie, /if \(status === "accepted"\) startMetrika\(\)/);
  assert.match(cookie, /if \(saved === "accepted"\) startMetrika\(\)/);
});

test('Responsive navigation is present', () => {
  assert.match(html, /id="menu-toggle" aria-controls="main-nav" aria-expanded="false"/);
  assert.match(html, /mainNav\.classList\.toggle\('is-open'\)/);
});


test('Aqua theme: load only visual overrides after inline layout CSS', () => {
  assert.match(html, /<\/style>\s*<link rel="stylesheet" href="\.\/aqua-overrides\.css">/);
  assert.match(aqua, /\/\* Soft aqua redesign \*\//);
  assert.match(aqua, /\.cookie-banner\s*\{/);
  assert.match(aqua, /\.mobile-cta\s*\{/);
  assert.doesNotMatch(aqua, /^:root\s*\{/m, 'Legacy root/theme CSS must not be reloaded');
  assert.doesNotMatch(aqua, /\.portrait-wrap\s*\{/, 'Old-page portrait layout must not be reloaded');
});
