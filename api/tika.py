#!/usr/bin/env python
import requests
import sys
urlmeta = 'http://localhost:9998/meta'
urltext = 'http://localhost:9998/tika'

def printTags(r):
    for line in r.text.split('\n'):
        if line:
            print "line = " + line
            items = line.split('","')
            print items
            print items[0].replace('"', '', 1)
            lastpos = items[1].rfind('"')
            print items[1].replace('"', '', lastpos)

file = sys.argv[1]
with open(file, 'rb') as fh:
    data = fh.read()
    print "============="
    r = requests.put(urltext, data=data)
    print r.status_code
    print r.headers
    print r.request.headers
    #printTags(r)
    #print r.headers
    #items = r.text.split('\n')[0].split('","')
    #r2 = requests.put(urltext, data=data)
    #print r2.status_code
    #print r2.text


