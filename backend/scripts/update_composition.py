#!/usr/bin/env python

import rethinkdb as r

conn = r.connect("localhost", '30815', "materialscommons")


def get_all_compositions():
    rr = r.table('samples').pluck('properties').run(conn)
    print rr

if __name__ == "__main__":
    get_all_compositions()

