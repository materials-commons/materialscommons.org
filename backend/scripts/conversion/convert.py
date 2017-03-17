#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


def msg(s):
    print s
    sys.stdout.flush()


def fix_missing_property_sets(conn):
    print "Fixing samples that having missing property sets..."
    process_property_sets = list(r.table('process2sample').run(conn))
    for p2s in process_property_sets:
        s2p = list(r.table('sample2propertyset').get_all(p2s['property_set_id'], index='property_set_id').run(conn))
        if not s2p:
            print "The following property set is missing %s" % (p2s['property_set_id'])
            r.table('sample2propertyset').insert({
                'current': True,
                'property_set_id': p2s['property_set_id'],
                'sample_id': p2s['sample_id'],
                'version': ''
            }).run(conn)
    print "Done."


def fix_file_upload_count_to_uploaded(conn):
    print "Add file uploaded with value from upload, removing upload..."
    r.table('datafiles').filter(r.row.has_fields('upload')) \
        .update({'uploaded': r.row['upload']}, durability="soft").run(conn)
    r.table('datafiles').filter(r.row.has_fields('upload')) \
        .replace(r.row.without('upload'), durability="soft").run(conn)
    print "Done."


def update_projects_with_new_fields(conn):
    print "Adding additional fields to projects. Swap overview and description..."
    r.table('projects').replace(r.row.without('note')).run(conn)
    projects = list(r.table('projects').run(conn))
    for p in projects:
        p['overview'] = p['description']
        p['description'] = ''
        p['reminders'] = []
        p['status'] = 'active'
        p['flag'] = 'none'
        p['tags'] = []
        r.table('projects').get(p['id']).update(p).run(conn)
    print "Done."


def add_collaborators_to_projects(conn):
    print "Creating project collaborators..."
    projects = list(r.table('projects').run(conn))
    for p in projects:
        project_experiments = list(r.table('project2experiment').get_all(p['id'], index="project_id")
                                   .eq_join('experiment_id', r.table('experiments')).zip().run(conn))
        project_users = list(r.table('access').get_all(p['id'], index='project_id')
                             .eq_join('user_id', r.table('users')).zip().run(conn))
        internal_collaborators = []
        external_collaborators = []
        for puser in project_users:
            if puser['user_id'] != p['owner']:
                internal_collaborators.append({
                    'user_id': puser['user_id'],
                })
        all_users = list(r.table('users').run(conn))
        for e in project_experiments:
            for c in e['collaborators']:
                if not is_already_collaborator(c, project_users):
                    existing_user = find_existing(c, all_users)
                    if existing_user:
                        internal_collaborators.append({
                            'user_id': existing_user['id']
                        })
                    else:
                        external_collaborators.append({
                            'email': '',
                            'fullname': c,
                            'affiliation': ''
                        })
        r.table('projects').get(p['id']).update({
            'internal_collaborators': internal_collaborators,
            'external_collaborators': external_collaborators
        }).run(conn)
    print "Done."


def fix_experiment_collaborators(conn):
    print "Separating experiment collaborators into internal and external collaborators..."
    projects = list(r.table('projects').run(conn))
    for p in projects:
        project_experiments = list(r.table('project2experiment').get_all(p['id'], index="project_id")
                                   .eq_join('experiment_id', r.table('experiments')).zip().run(conn))
        all_users = list(r.table('users').run(conn))
        for e in project_experiments:
            external_collaborators = []
            internal_collaborators = []
            for c in e['collaborators']:
                existing_user = find_existing(c, all_users)
                if existing_user:
                    internal_collaborators.append({'user_id': existing_user['id']})
                else:
                    ec = find_external_collaborator(c, p['external_collaborators'])
                    external_collaborators.append(ec)
            # r.table('experiments').get(e['id']).replace(r.row.without('collaborators')).run(conn)
            r.table('experiments').get(e['id']).update({
                'internal_collaborators': internal_collaborators,
                'external_collaborators': external_collaborators
            }).run(conn)
    print "Done."


def is_already_collaborator(who, collaborators):
    for c in collaborators:
        if who == c['fullname']:
            return True
    return False


def find_existing(who, all_users):
    for u in all_users:
        if who == u['fullname']:
            return u
    return None


def find_external_collaborator(who, external_collaborators):
    for ec in external_collaborators:
        if who == ec['fullname']:
            return ec
    return None


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")

    fix_missing_property_sets(conn)
    update_projects_with_new_fields(conn)
    add_collaborators_to_projects(conn)
    fix_experiment_collaborators(conn)
    fix_file_upload_count_to_uploaded(conn)


if __name__ == "__main__":
    main()
