import urllib.request
import re
import json

url = "https://poe2db.tw/us/Item"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    content = urllib.request.urlopen(req).read().decode('utf-8')
    print("Fetched PoE2DB item page!")
    # Just to check if we can reach it
except Exception as e:
    print("Error fetching PoE2DB:", e)

