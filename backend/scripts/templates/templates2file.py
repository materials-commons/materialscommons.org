#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import json
import os

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')

    templates = list(r.table('templates').run(conn))

    try:
        os.mkdir('/tmp/templates')
    except:
        pass

    for template in templates:
        try:
            with open("/tmp/templates/{}".format(template['name']), 'w') as out:
                json.dump(template, out, indent=4)
        except:
            pass
