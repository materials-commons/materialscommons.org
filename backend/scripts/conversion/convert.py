#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def remove_nulls_in_setup(conn):
    print "Removing nulls in setup..."
    r.table('setupproperties').filter({'unit': None}).update({'unit': ''}).run(conn)
    r.table('setupproperties').filter({'value': None}).update({'value': ''}).run(conn)
    print "Done."


def remove_duplicates_in_sample2datafile(conn):
    print "Removing duplicate sample2datafile entries..."
    already_seen = {}
    s2df_entries = list(r.table('sample2datafile').run(conn))
    for s2df in s2df_entries:
        if s2df['datafile_id'] not in already_seen:
            already_seen[s2df['datafile_id']] = True
        else:
            print "Deleting duplicate sample2datafile entry"
            r.table('sample2datafile').get(s2df['id']).delete().run(conn)
    print "Done."


def change_processes_field_to_description(conn):
    """ Combine the process what and why fields into a single description field
    and then delete the what and why fields. Users are confused by the two
    fields.
    :param conn: connection to the database
    """
    print "Combining what/why field in processes into description..."
    print "Done."


def convert_setup_selections_to_name_value(conn):
    """ Selections display the external name rather than value field. This
    would allow users to search on those fields without having to know the
    internal name.
    :param conn: connect to the database
    """
    print "Converting setup selections to name/value pair"
    print "Done."


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")
    remove_nulls_in_setup(conn)
    remove_duplicates_in_sample2datafile(conn)
    # change_processes_field_to_description(conn)
    # convert_setup_selections_to_name_value(conn)

if __name__ == "__main__":
    main()
