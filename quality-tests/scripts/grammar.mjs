// LanguageTool check (open-source Grammarly alternative). Usage: node grammar.mjs file...
import fs from 'fs';
const prose = (t) => t.split(/\n\s*(?:References|Bibliography)\s*\n/)[0].split('\n').map((l) => l.trim())
  .filter((l) => l && (l.match(/\|/g) ?? []).length < 2 && (l.split(/\s+/).length > 12 || /[.!?:]$/.test(l))).join('\n\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const f of process.argv.slice(2)) {
  const text = prose(fs.readFileSync(f, 'utf8'));
  const res = await fetch('https://api.languagetool.org/v2/check', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ text, language: 'en-US' }) });
  const j = await res.json();
  const issues = j.matches.map((m) => ({ cat: m.rule.category.id, rule: m.rule.id, msg: m.shortMessage || m.message, ctx: m.context.text.slice(Math.max(0, m.context.offset - 25), m.context.offset + m.context.length + 25) }));
  const byCat = {};
  for (const i of issues) byCat[i.cat] = (byCat[i.cat] ?? 0) + 1;
  console.log(`\n${f}: ${text.split(/\s+/).length} words, ${issues.length} issues ${JSON.stringify(byCat)}`);
  for (const i of issues) console.log(`   [${i.cat}/${i.rule}] ${i.msg} :: …${i.ctx.replace(/\s+/g, ' ')}…`);
  await sleep(3500);
}
