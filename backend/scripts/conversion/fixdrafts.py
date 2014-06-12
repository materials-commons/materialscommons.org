#!/usr/bin/env python

import rethinkdb as r
import optparse

if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db='materialscommons')

    drafts = list(r.table('drafts').run(conn, time_format='raw'))
    for draft in drafts:
        if 'process' not in draft:
            continue
        input_conditions = draft['process']['input_conditions']
        if 'APT Instrument Properties' in input_conditions:
            what = input_conditions['APT Instrument Properties']
            for prop in what['default_properties']:
                if prop['attribute'] == 'evaporation_rate':
                    prop['unit_choice'] = prop['value_choice']
                    prop['value_choice'] = []
                    prop['value'] = ""
                    prop['unit'] = ""
                    prop['type'] = "number"
                    r.table('drafts').get(draft['id']).update(draft).run(conn)
