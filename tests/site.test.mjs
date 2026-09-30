import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const html = read('index.html');
const cookie = read('cookie-consent.js');
const mono = read('monochrome-overrides.css');

test('Telegram: navigation and intro copy are exact', () => {
  assert.match(html, /<a href="#questions">Проект<\/a>/);
  assert.match(html, /<h2>Направления работы<br><span>в проекте<\/span><\/h2>/);
  const sectionMarkers = [...html.matchAll(/<div class="section-index">([^<]+)<\/div>/g)].map(m => m[1]);
  assert.deepEqual(sectionMarkers, ['01', '02', '03']);
  assert.doesNotMatch(html, /01 \/|02 \/|03 \/);
  assert.doesNotMatch(html, /<span class="benefit-kicker">/);
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

test('Telegram Sep 30: benefit comparison copy is updated', () => {
  assert.match(html, /Отчёт и работа с тренером — 1 раз в 7 дней \(день недели выбираете по договорённости\)\./);
  assert.equal((html.match(/Корректировка тренировочного протокола и рабочих весов — 1 раз в 7 дней\./g) || []).length, 2);
  assert.match(html, /Тренер разбирает все видео с ваших тренировок регулярно в режиме 6\/1\./);
  assert.match(html, /Тренер разбирает 10 видеоотчётов в неделю\./);
  assert.match(html, /Корректировка выполняется в рамках еженедельной консультации\./);
  assert.match(html, /Больше обратной связи от тренера, чтобы вы всегда были в ресурсе\. Обратная связь — 1 раз в неделю\./);
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


test('Monochrome theme: load only visual overrides after inline layout CSS', () => {
  assert.match(html, /<\/style>\s*<link rel="stylesheet" href="\.\/monochrome-overrides\.css">/);
  assert.match(mono, /\/\* Strict monochrome visual layer\./);
  assert.match(mono, /\.cookie-banner\s*\{/);
  assert.match(mono, /\.mobile-cta\s*\{/);
  assert.doesNotMatch(mono, /^:root\s*\{/m, 'Legacy root/theme CSS must not be reloaded');
  assert.doesNotMatch(mono, /\.portrait-wrap\s*\{/, 'Old-page portrait layout must not be reloaded');
});

test('Monochrome palette has no blue accent tokens', () => {
  assert.match(html, /--bg:#050505;/);
  assert.match(html, /--blue:#f5f5f5;/);
  assert.match(html, /--blue-strong:#dedede;/);
  assert.match(html, /--blue-soft:#ffffff;/);
  assert.doesNotMatch(html, /#78c9f2|#50b2e8|#d7f1ff/i);
  assert.doesNotMatch(mono, /rgba\(120,201,242|rgba\(80,178,232|#78c9f2|#50b2e8/i);

  const inlineCss = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
  const chromaticHex = [...inlineCss.matchAll(/#([0-9a-f]{6})\b/gi)].filter(([, h]) => {
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return r !== g || g !== b;
  });
  const chromaticRgb = [...inlineCss.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/gi)]
    .filter(([, r, g, b]) => r !== g || g !== b);
  assert.equal(chromaticHex.length, 0);
  assert.equal(chromaticRgb.length, 0);
});
