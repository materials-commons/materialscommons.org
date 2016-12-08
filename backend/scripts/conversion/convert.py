#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


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


def fix_template_name(conn):
    print "Fixing template names..."
    processes = list(r.table('processes').run(conn, ))
    for proc in processes:
        if 'template_name' not in proc:
            if proc['process_name'] == 'Annealing':
                proc['template_name'] = 'Heat Treatment'
            else:
                proc['template_name'] = proc['process_name']
            r.table('processes').get(proc['id']).update({'template_name': proc['template_name']}).run(conn)
    print "Done."


def convert_to_otype(conn):
    print "Convert to otype..."
    rename_to_otype('datadirs', conn)
    rename_to_otype('datafiles', conn)
    rename_to_otype('experiments', conn)
    rename_to_otype('experimenttasks', conn)
    rename_to_otype('measurements', conn)
    rename_to_otype('processes', conn)
    rename_to_otype('projects', conn)
    rename_to_otype('properties', conn)
    rename_to_otype('samples', conn)
    rename_to_otype('setupproperties', conn)
    rename_to_otype('setups', conn)
    print "Done."


def rename_to_otype(table, conn):
    print "   Converting table %s" % table
    r.table(table).filter(r.row.has_fields('_type')).replace(lambda doc: doc.merge({'otype': doc['_type']}).without('_type')).run(conn)
    print "   Done."


def fix_missing_processes_for_measurements(conn):
    print "Associating processes with composition measurements (where missing)..."
    measurements = list(r.table('measurements').filter({'otype': 'composition'}).run(conn))
    for m in measurements:
        p2m = list(r.table('process2measurement').get_all(m['id'], index='measurement_id').run(conn))
        if not p2m:
            print "\nCould not find process for measurement %s" % m['id']
            p = list(r.table('property2measurement').get_all(m['id'], index='measurement_id').run(conn))
            p_id = p[0]['property_id']
            ps = list(r.table('propertyset2property').get_all(p_id, index='property_id').run(conn))
            ps_id = ps[0]['property_set_id']
            s2ps = list(r.table('sample2propertyset').get_all(ps_id, index='property_set_id').run(conn))
            s_id = s2ps[0]['sample_id']
            processes = list(r.table('process2sample').get_all(s_id, index='sample_id')
                             .eq_join('process_id', r.table('processes')).zip().run(conn))
            for proc in processes:
                if 'template_name' in proc and proc['template_name'] == 'Create Samples':
                    r.table('process2measurement').insert({
                        'process_id': proc['process_id'],
                        'measurement_id': m['id']
                    }).run(conn)
    print "Done."


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    convert_to_otype(conn)
    fix_template_name(conn)
    fix_missing_processes_for_measurements(conn)

    # Not sure of these steps:
    # change_processes_field_to_description(conn)
    # convert_setup_selections_to_name_value(conn)

if __name__ == "__main__":
    main()
