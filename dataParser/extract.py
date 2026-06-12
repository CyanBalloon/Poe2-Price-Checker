import re
from bs4 import BeautifulSoup

with open(r'C:\Users\14900k\.gemini\antigravity-ide\brain\057fe78b-6555-4181-96fb-4a1b3a98c7ee\.system_generated\steps\616\content.md', 'r', encoding='utf-8') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')

overrides = {}
for div in soup.select('.d-flex.border-top.rounded'):
    # image url
    img = div.select_one('img')
    if not img: continue
    url = img.get('src')
    if not url: continue
    
    # name
    a = div.select_one('.flex-grow-1 > div > a')
    if not a: continue
    name = a.text.strip()
    
    overrides[name] = url

with open('overrides.json', 'w', encoding='utf-8') as f:
    import json
    json.dump(overrides, f, indent=4, ensure_ascii=False)

print(f"Total extracted: {len(overrides)}")
