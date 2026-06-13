import urllib.request, json

req = urllib.request.Request('https://api.exiledexchange2.dev/proxy/data/namespaceMap.json', headers={'User-Agent': 'Mozilla/5.0'})
try:
    data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    for item in data['map']:
        if 'Gem' in item.get('type', '') or 'GEM' in item.get('ns', ''):
            print(f"type: {item['type']}, ns: {item['ns']}")
except Exception as e:
    print("Error:", e)
