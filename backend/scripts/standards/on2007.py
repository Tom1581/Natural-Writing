"""Ontario 2007 secondary English (Grades 10–12): extracts the Writing strand's specific
expectations from the text of the official PDFs, without the examples in parentheses.
Usage: python3 -I on2007.py research/on910.txt research/on1112.txt research/on2007.json
The line ranges are the ENG2D, ENG3U and ENG4U Writing sections in pdftext.py output."""
import re, sys, json
def parse(path, a, b):
    lines = open(path).read().split('\n')[a:b]
    keep = []
    for l in lines:
        if l.startswith('=== page') or re.match(r'^\d+\s*(WRITING|English)', l) or 'THE ONTARIO CURRICULUM' in l: continue
        if re.match(r'^\d\. (TLE|TL )', l) or re.match(r'^ENG\d[A-Z]$', l.strip()): continue
        keep.append(l.strip())
    t = ' '.join(keep)
    t = re.sub(r'(\w)- (\w)', r'\1\2', t)  # line-break hyphens
    t = re.sub(r'\s+', ' ', t)
    out = {}
    for m in re.finditer(r'(?<![\d.])([1-4]\.\d) ([a-z][^()]*?)(?= \(e\.g\.| Teacher prompt| [1-4]\.\d [a-z]|$)', t):
        code, text = m.group(1), m.group(2).strip()
        text = re.sub(r'\s*\d+$', '', text)
        if code not in out: out[code] = text
    return out

if __name__ == '__main__':
    import json
    a, b, out = sys.argv[1:4]
    json.dump({'ENG2D': parse(a, 4586, 4980), 'ENG3U': parse(b, 2334, 2841), 'ENG4U': parse(b, 6118, 6618)}, open(out, 'w'), indent=1, ensure_ascii=False)
