import urllib.request
import re

try:
    url = 'https://poe2db.tw/us/Uhtreds_Rite'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    matches = set(re.findall(r'https://web\.poecdn\.com/gen/image/[^\'\"]+', html))
    print('\n'.join(matches))
except Exception as e:
    print('Error:', e)
