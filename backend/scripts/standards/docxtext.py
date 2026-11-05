import sys, zipfile, re
z = zipfile.ZipFile(sys.argv[1])
xml = z.read('word/document.xml').decode('utf8')
paras = re.findall(r'<w:p[ >].*?</w:p>', xml, re.S)
for p in paras:
    t = ''.join(re.findall(r'<w:t[^>]*>(.*?)</w:t>', p, re.S))
    t = t.replace('&amp;','&').replace('&lt;','<').replace('&gt;','>').replace('&quot;','"').replace('&apos;',"'")
    if t.strip(): print(t)
