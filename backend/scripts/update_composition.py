#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import json


def get_all_compositions():
    all_samples = list(r.table('samples').run(conn, time_format='raw'))
    d = dict()
    d = {
            "10 wt% Gd": [{"element": "Gd", "value": "10"}],
            "Fe-10.10 wt%" : [{"element": "Fe", "value": "10.10"}],
            "Fe-14.25 wt%" : [{"element": "Fe", "value": "14.25"}],
            "Fe-5.4 wt%" : [{"element": "Fe", "value": "5.4"}],
            "Mg-3.74 Y-2.10 Nd-0.52 Gd-0.45 Zr-0.016 Zn (Wt%)" : [{"element": "Mg", "value": "3.74"},{"element": "Y", "value": "2.10"},
                                                                  {"element": "Nd", "value": "0.52"} ,{"element": "Gd", "value": "0.45"},
                                                                  {"element": "Zr", "value": "0.016"}, {"element": "Zn", "value": ""}],
            "Mg-9wt%Al-1wt%Zn" : [{"element": "Mg", "value": "9"},{"element": "Al", "value": "1"}, {"element": "Zn", "value": ""}],
            "Mg-9wt/o Aluminum" : [{"element": "Mg", "value": "9"}, {"element": "Al", "value":  ""}],
            "MgAl" : [{"element": "Mg", "value": ""}, {"element": "Al", "value": ""}],
            "Ti-0wt%Al" : [{"element":"Ti", "value": "0"}, {"element": "Al", "value": ""}],
            "Ti-4wt%Al": [{"element": "Ti", "value": "4"}, {"element": "Al", "value":  ""}],
            "Ti-7wt%Al" : [{"element": "Ti", "value": "7"}, {"element": "Al", "value":  ""}]   
        }
    for each_sample in all_samples:
        if each_sample[u'properties'][u'composition'][u'value'] in d.keys():
            rv = r.table('samples').get(each_sample[u'id']).update({'properties' : {'composition': {'value': d[each_sample[u'properties'][u'composition'][u'value']], 'unit': 'wt%'}}, 'projects': []}).run(conn)
        pass


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    if options.port is None:
        options.port = 30815
    conn = r.connect('localhost', options.port, db='materialscommons')
    get_all_compositions()

