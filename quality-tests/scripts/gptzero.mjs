// Score text files with GPTZero's official API (needs a paid key from https://gptzero.me/api).
// Usage: GPTZERO_API_KEY=... node gptzero.mjs ../samples/*.txt
import fs from 'fs';

const key = process.env.GPTZERO_API_KEY;
if (!key) {
  console.error('Set GPTZERO_API_KEY first. Without a key, paste the files into https://gptzero.me by hand.');
  process.exit(1);
}

for (const file of process.argv.slice(2)) {
  // Detectors judge prose, so leave out the reference list.
  const document = fs.readFileSync(file, 'utf8').split(/\n\s*References\s*\n/)[0];
  const res = await fetch('https://api.gptzero.me/v2/predict/text', {
    method: 'POST',
    headers: { 'x-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ document }),
  });
  const body = await res.json();
  const doc = body.documents?.[0];
  if (!res.ok || !doc) {
    console.log(file, res.status, JSON.stringify(body).slice(0, 300));
    continue;
  }
  console.log(file, '| predicted:', doc.predicted_class ?? '?', '| probabilities:', JSON.stringify(doc.class_probabilities ?? { ai: doc.completely_generated_prob }));
}
