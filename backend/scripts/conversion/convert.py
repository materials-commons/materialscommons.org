#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def fix_mcpub_missing_process_types(conn):
    print "Fixing missing process_type entries..."
    processes = list(r.db('mcpub').table('processes').filter(~r.row.has_fields('process_type')).run(conn))
    for process in processes:
        template = r.table('templates').get(process['template_id']).run(conn)
        r.db('mcpub').table('processes').get(process['id']).update({'process_type': template['process_type']}).run(conn)
    print "Done."


def fix_bad_mcpub_process_types(conn):
    print "Fixing bad process_type entries..."
    processes = list(r.db('mcpub').table('processes').run(conn))
    for process in processes:
        if is_bad_process_type(process):
            if 'template_id' in process:
                template = r.table('templates').get(process['template_id']).run(conn)
                r.db('mcpub').table('processes').get(process['id']).update({
                    'process_type': template['process_type']
                }).run(conn)
            else:
                template_id = 'global_' + process['process_name']
                if process['process_name'] == 'As Received':
                    template_id = 'global_Create Samples'
                template = r.table('templates').get(template_id).run(conn)
                r.db('mcpub').table('processes').get(process['id']).update({
                    'process_type': template['process_type'],
                    'template_id': template['id']
                }).run(conn)

    print "Done."


def is_bad_process_type(p):
    pt = p['process_type']
    if pt == 'analysis':
        return False
    elif pt == 'create':
        return False
    elif pt == 'measurement':
        return False
    elif pt == 'transform':
        return False
    else:
        return True


def add_template_admin_flag_to_users(conn):
    print "Adding template admin flag to all users..."
    r.table('users').update({'is_template_admin': False}).run(conn)
    print "Done."


def add_template_owner(conn):
    print "Adding 'template-admin' as owner for all templates..."
    r.table('templates').update({'owner': 'template-admin'}).run(conn)
    print "Done."


def fix_missing_category_for_create_samples(conn):
    r.table('processes').filter({'template_id': 'global_Create Samples'}).update({'category': 'create_sample'}).run(
        conn)


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    fix_mcpub_missing_process_types(conn)
    fix_bad_mcpub_process_types(conn)
    add_template_admin_flag_to_users(conn)
    add_template_owner(conn)
    fix_missing_category_for_create_samples(conn)


if __name__ == "__main__":
    main()
