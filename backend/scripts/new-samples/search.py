#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys
import json


def main(conn):
    value = list(r.table("samples")
                 .eq_join("id", r.table("sample2attribute_set"),
                          index="sample_id")
                 .zip()
                 .merge(lambda aset: {
                     "attributes": r.table("attribute_set2attribute")
                     .get_all(aset["attribute_set_id"],
                              index="attribute_set_id")
                     .eq_join("attribute_id", r.table("attributes"))
                     .zip()
                     .merge(lambda attr: {
                         "best_measure": r.table("measurements")
                         .get(attr["best_measure_id"]),
                         "history": r.table("best_measure_history")
                         .get_all(attr["id"], index="attribute_id")
                         .merge(lambda best: {
                             "measurement": r.table("measurements")
                             .get(best["measurement_id"]).default("")
                         })
                         .coerce_to("array"),
                         "measurements": r.table("attribute2measurement")
                         .get_all(attr["id"], index="attribute_id")
                         .eq_join("measurement_id", r.table("measurements"))
                         .zip()
                         .coerce_to("array")
                     })
                     .coerce_to("array")
                 })
                 .filter(lambda entry: entry["attributes"].contains(
                     lambda element: element["best_measure"]["properties"]
                     ["grain_size"]["value"].eq(1.09)))
                 .run(conn, time_format="raw"))
    print json.dumps(value)

# http://stackoverflow.com/questions/23046809/filtering-based-on-key-value-in-all-objects-in-array-in-rethinkdb

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect("localhost", options.port, db="samplesdb")
    main(conn)
