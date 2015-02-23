#!/usr/bin/env python
# http://stackoverflow.com/questions/23046809/filtering-based-on-key-value-in-all-objects-in-array-in-rethinkdb

import rethinkdb as r
from optparse import OptionParser
import json
import sys


def string_or_number(s):
    try:
        val = int(s)
        return val
    except ValueError:
        try:
            val = float(s)
            return val
        except ValueError:
            return s


class PropertyPath(object):
    def __init__(self, path):
        self.path = path

    def path_match(self, prop_hash):
        """Match against a list of path element, prop_hash
        is the hash we want to descend through in out list
        of path elements making sure they all match.
        Returns 'True, value' if there was a match, and
        'False,""' otherwise.
        """
        in_path = prop_hash
        for path_element in self.path:
            if path_element in in_path:
                in_path = in_path[path_element]
            else:
                return False, ""
        return True, in_path


class SingleAttrQuery(PropertyPath):
    def __init__(self, value, _type, *path):
        PropertyPath.__init__(self, path)
        self.value = string_or_number(value)
        self._type = _type

    def match(self, value):
        if self._type == "LT":
            return value < self.value
        elif self._type == "LTE":
            return value <= self.value
        elif self._type == "GT":
            return value > self.value
        elif self._type == "GTE":
            return value >= self.value
        elif self._type == "EQ":
            return self.value == value
        elif self._type == "KN":
            # if we got here then there is a value
            return True
        else:
            return False

    def is_unknown(self):
        return self._type == "UNK"


class RangeQuery(PropertyPath):
    def __init__(self, left_value, left_type, right_value, right_type, *path):
        PropertyPath.__init__(self, path)
        self.left_value = string_or_number(left_value)
        self.left_type = left_type
        self.right_value = string_or_number(right_value)
        self.right_type = right_type
        self.path = path

    def match(self, value):
        lower_bound = self._match(self.left_type, self.left_value, value)
        upper_bound = self._match(self.right_type, value, self.right_value)
        return lower_bound and upper_bound

    def _match(self, _type, value_left, value_right):
        if _type == "LT":
            return value_left < value_right
        elif _type == "LTE":
            return value_left <= value_right
        elif _type == "GT":
            return value_right < value_left
        elif _type == "GTE":
            return value_right <= value_left
        else:
            return False

    def is_unknown(self):
        return False


class Query2(object):
    def __init__(self, _type, *sub_queries):
        self._type = _type
        self.sub_queries = sub_queries


def match_query(samples, *queries):
    matching_samples = []
    for sample in samples:
        matched_attrs = []
        for attr in sample["attributes"]:
            for query in queries:
                matched, value = query.path_match(attr)
                if matched and query.match(value):
                    matched_attrs.append(True)
                elif not matched and query.is_unknown():
                    matched_attrs.append(True)
        if len(matched_attrs) == len(queries):
            matching_samples.append(sample)
    return matching_samples


def search(conn, queries):
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


def construct_single_queries(query_list):
    queries = []
    for query in query_list:
        pieces = query.split(":")
        # 0 is path
        # 1 is operator
        # 2 is value
        path = pieces[0].split(",")
        q = SingleAttrQuery(pieces[2], pieces[1], *path)
        queries.append(q)
    return queries


def construct_range_queries(rquery_list):
    queries = []
    for rquery in rquery_list:
        pieces = rquery.split(":")
        # 0 is path
        # 1 is operator
        # 2 is value
        # 3 is operator
        # 4 is value
        path = pieces[0].split(",")
        q = RangeQuery(pieces[2], pieces[1], pieces[4], pieces[3], *path)
        queries.append(q)
    return queries


def construct_queries(query_list, rquery_list):
    all_queries = construct_single_queries(query_list)
    rqueries = construct_range_queries(rquery_list)
    all_queries.extend(rqueries)
    return all_queries


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-q", "--query", dest="queries", action="append",
                      help="queries to run (path:operator:value) where " +
                      "path is comma separated", default=[])
    parser.add_option("-r", "--rquery", dest="rqueries", action="append",
                      help="range queries to run " +
                      "(path:operator:value:operator:value)", default=[])
    (options, args) = parser.parse_args()
    if not options.queries and not options.rqueries:
        print "You must specify a query"
        sys.exit(1)
    queries = construct_queries(options.queries, options.rqueries)
    conn = r.connect("localhost", options.port, db="samplesdb")
    search(conn, queries)
    # sys.exit(0)
    # range_query = RangeQuery(4, "LT", 5, "LT", "ignore")
    # print range_query.match(4.5)
    # print range_query.match(6)
    # print range_query.match(3)
    # print "======================"
    # range_query = RangeQuery(4, "LTE", 6, "LT", "ignore")
    # print range_query.match(4)
    # print range_query.match(6)
    # print range_query.match(7)
    # print range_query.match(3)
    # print range_query.match(5)
