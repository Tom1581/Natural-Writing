import sys
sys.path.insert(0, sys.argv[1])
from pypdf import PdfReader
r = PdfReader(sys.argv[2])
for i, p in enumerate(r.pages):
    t = p.extract_text() or ''
    print(f"=== page {i+1} ===")
    print(t)
