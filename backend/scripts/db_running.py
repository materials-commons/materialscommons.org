#!/usr/bin/env python
#
# db_running.py will attempt to connect to the database. It will retry --retry times (defaults to 100), and will
# sleep for --sleep time (defaults to 1 second). It connects to the database on --port (defaults to 30815).
# db_running.py will exit 0 if is successfully connects. It will exit 1 if it cannot connect within the number of
# retry attempts. It will also exit 1 if --retry or --sleep are improperly specified.

import optparse
import sys
import time

import rethinkdb as r


def connect(port):
    try:
        r.connect('localhost', port, db="materialscommons")
        return True
    except:
        return False


if __name__ == "__main__":
    parser = optparse.OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    parser.add_option("-r", "--retry", dest="retry", type="int", help="number of retries", default=100)
    parser.add_option("-s", "--sleep", dest="sleep", type="int", help="sleep time between retries", default="3")

    (options, args) = parser.parse_args()

    if options.retry < 1:
        print("Retry count must be a positive number: %d" % options.retry)
        sys.exit(1)

    if options.sleep < 1:
        print("Sleep time must be a positive number: %d" % options.sleep)
        sys.exit(1)

    for i in range(0, options.retry):
        # print("Attempting to connect to rethinkdb on port %d (%d)" % (options.port, i) )
        if connect(options.port):
            sys.exit(0)
        time.sleep(options.sleep)

    sys.exit(1)
