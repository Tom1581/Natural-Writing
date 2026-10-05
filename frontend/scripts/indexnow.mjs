// Tell Bing, Yandex, and other IndexNow search engines about every URL in the sitemap.
// Run after each deploy:  npm run indexnow
// The key must match public/1e90b6153282898975fd37e8f2c96364.txt, which proves we own the site.
const HOST = 'naturalquill.one';
const KEY = '1e90b6153282898975fd37e8f2c96364';

const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) throw new Error('No URLs found in the sitemap');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
// 200 or 202 means accepted; 403 means the key file is not live yet.
console.log(`IndexNow responded ${res.status} for ${urlList.length} URLs`);
if (!res.ok) process.exitCode = 1;
