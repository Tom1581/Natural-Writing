import sys, re, html, glob, json, os
out = {}
for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.html'))):
    s = open(f, encoding='utf8', errors='replace').read()
    for m in re.finditer(r'<div class="(?:sub)?standard"><a [^>]*name="CCSS\.ELA-Literacy\.([WL]\.(?:K|\d+(?:-\d+)?)\.\d+(?:\.[a-z])?)">[^<]*</a><br/>(.*?)</div>', s, re.S):
        text = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', m.group(2)))).strip()
        out[m.group(1)] = text
    # Kindergarten pages list standards as <li> items instead of <div class="standard">.
    for m in re.finditer(r'<li><a [^>]*>CCSS\.ELA-Literacy\.([WL]\.K\.\d+(?:\.[a-z])?)</a>\s+(.*?)</li>', s, re.S):
        out.setdefault(m.group(1), html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', m.group(2)))).strip())
json.dump(out, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False)
print(len(out))
