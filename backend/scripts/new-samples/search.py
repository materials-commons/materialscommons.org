#!/usr/bin/env python
# http://stackoverflow.com/questions/23046809/filtering-based-on-key-value-in-all-objects-in-array-in-rethinkdb

import rethinkdb as r
from optparse import OptionParser
import json
import sys


class Query(object):
    def __init__(self, value, *path):
        self.value = str(value)
        self.path = path


def is_property(best, *props):
    in_path = best
    for prop in props:
        if prop in in_path:
            in_path = in_path[prop]
        else:
            return False, ""
    return True, in_path


def match_query(samples, *queries):
    matching_samples = []
    for sample in samples:
        matched_attrs = []
        for attr in sample["attributes"]:
            for query in queries:
                matched, value = is_property(attr, *query.path)
                if matched and str(value) == query.value:
                    matched_attrs.append(True)
        if len(matched_attrs) == len(queries):
            matching_samples.append(sample)
    return matching_samples


def main(conn, queries):
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
                         .get(attr["best_measure_id"])
                     })
                     .coerce_to("array")
                 })
                 .run(conn, time_format="raw"))
    ms = match_query(value, *queries)
    print json.dumps(ms)


def construct_queries(query_list):
    queries = []
    for query in query_list:
        pieces = query.split(":")
        # 0 is path portion
        # 1 is value
        path = pieces[0].split(",")
        q = Query(pieces[1], *path)
        queries.append(q)
    return queries


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-q", "--query", dest="queries", action="append",
                      help="queries to run (path:value) where path is comma separated")
    (options, args) = parser.parse_args()
    if not options.queries:
        print "You must specify a query"
        sys.exit(1)
    queries = construct_queries(options.queries)
    conn = r.connect("localhost", options.port, db="samplesdb")
    main(conn, queries)
