#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys
import json


def main(port, process_id):
    conn = r.connect("localhost", port, db="samplesdb")
    value = list(r.table("processes").get_all(process_id)
                 .eq_join("id", r.table("process2sample"), index="process_id")
                 .zip()
                 .eq_join("attribute_set_id", r.table("sample2attribute_set"),
                          index="attribute_set_id")
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
                 .run(conn, time_format="raw"))
    print json.dumps(value[0])


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-p", "--process", dest="process",
                      help="process id")
    (options, args) = parser.parse_args()
    if options.process is None:
        print "You must specify a process id"
        sys.exit(1)
    main(options.port, options.process)
