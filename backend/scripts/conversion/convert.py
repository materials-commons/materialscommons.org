#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import sys


used_files = {}


def msg(s):
    print s
    sys.stdout.flush()


def get_used_files(conn):
    global used_files
    used = list(r.table('datafiles').filter(r.row['usesid'].ne("")).pluck('usesid').
                eq_join('usesid', r.table('datafiles')).zip().run(conn))
    for u in used:
        used_files[u['id']] = u


def is_used_file(file_id):
    global used_files
    return file_id in used_files
    

def delete_tables(conn):
    """Delete tables that are no longer used."""
    msg("Deleting tables...")
    drop_table('templates', conn)
    drop_table('ui', conn)
    drop_table('projects2samples', conn)
    drop_table('process2item', conn)
    drop_table('runs', conn)
    drop_table('sample2item', conn)
    drop_table('saver', conn)
    drop_table('property_sets', conn)
    drop_table('project2processes', conn)
    drop_table('news', conn)
    drop_table('drafts', conn)
    drop_table('usergroups', conn)
    drop_table('comment2item', conn)
    drop_table('review2item', conn)
    msg("Done.")


def drop_table(table_name, conn):
    try:
        r.table_drop(table_name).run(conn)
    except r.RqlRuntimeError:
        pass


def reset_tables(conn):
    """Delete tables that will be recreated.
    The tables are recreated by the dbcreate.py script.
    """
    msg("Reseting tables...")
    drop_table('properties', conn)
    drop_table('notes', conn)
    drop_table('note2item', conn)
    drop_table('processes', conn)
    drop_table('project2datafile', conn)
    drop_table('reviews', conn)
    drop_table('samples', conn)
    drop_table('tags', conn)
    drop_table('tag2item', conn)
    drop_table('uploads', conn)
    msg("Done.")


def delete_projects(conn):
    """Delete projects that are no longer used."""
    msg("Deleting unused projects...")
    with open("projects2delete.txt") as f:
        for project_id in f:
            project_id = project_id.strip()
            msg("   Project %s" % project_id)
            delete_project(project_id, conn)
            delete_project_files(project_id, conn)
            delete_project_dirs(project_id, conn)
            delete_project_access(project_id, conn)
    msg("Done.")


def delete_project(project_id, conn):
    r.table('projects').get(project_id).delete().run(conn)
    pass


def delete_project_files(project_id, conn):
    """Delete all the files for the project"""
    msg("     Deleting project files...")
    files = list(r.table('project2datadir').get_all(project_id, index="project_id").
                 eq_join('datadir_id', r.table('datadir2datafile'), index='datadir_id').
                 zip().
                 eq_join('datafile_id', r.table('datafiles')).zip().run(conn))
    msg("Number of files to delete for project %s: %d" % (project_id, len(files)))
    for f in files:
        if not is_used_file(f['id']):
            delete_file(f['id'], conn)
        else:
            msg("      Not deleting file %s/%s because it is refered to" % (f['id'], project_id))
    msg("     Done.")


def delete_project_dirs(project_id, conn):
    msg("     Deleting project directories...")
    p2d_entries = list(r.table('project2datadir').get_all(project_id, index="project_id").
                       run(conn))
    for p2d in p2d_entries:
        r.table('project2datadir').get(p2d['id']).delete().run(conn)
        r.table('datadirs').get(p2d['datadir_id']).delete().run(conn)
        r.table('datadir2datafile').get_all(p2d['datadir_id'], index='datadir_id').delete().run(conn)
    msg("     Done.")


def delete_file(file_id, conn):
    r.table('datafiles').get(file_id).delete().run(conn)


# def delete_if_usesid_in_project(f, files, conn):
#     found = False
#     for file_entry in files:
#         if file_entry['id'] == f['usesid']:
#             found = True
#             break
#     if found:
#         delete_file(f['id'], conn)
#     else:
#         msg("     Leaving file id %s because it uses an id outside of project" % f['id'])


def delete_project_access(project_id, conn):
    """Delete all access entries for project in the access table"""
    r.table('access').get_all(project_id, index='project_id').delete().run(conn)


def reload_project2datafile(conn):
    """The project2datafile table is not up to date,
    so reload it with the files in a project.
    """
    msg("Reloading project2datafile table...")
    drop_table('project2datafile', conn)
    r.table_create('project2datafile').run(conn)
    r.table('project2datafile').index_create('project_id').run(conn)
    r.table('project2datafile').index_create('datafile_id').run(conn)
    projects = list(r.table('projects').run(conn))
    for project in projects:
        msg("   project %s/%s" % (project['name'], project['id']))
        project_id = project['id']
        files = list(r.table('project2datadir').get_all(project_id, index='project_id').
                     eq_join('datadir_id', r.table('datadir2datafile'), index='datadir_id').
                     zip().
                     run(conn))
        for f in files:
            entry = {
                'project_id': project_id,
                'datafile_id': f['datafile_id']
            }
            r.table('project2datafile').insert(entry).run(conn)
    msg("Done.")


def fix_mediatypes(conn):
    """Make sure each file has a mediatype set for it."""
    msg("Fixing missing mediatypes on files...")
    all_files = list(r.table('datafiles').run(conn))
    for f in all_files:
        if 'mediatype' not in f:
            mediatype = {
                "description": "unknown",
                "mime": "unknown"
            }
            msg("  Adding mediatype to %s %s" % (f['id'], f['name']))
            r.table('datafiles').get(f['id']).update(mediatype).run(conn)
    msg("Done.")


def main():
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    conn = r.connect('localhost', options.port, db="materialscommons")
    get_used_files(conn)
    delete_tables(conn)
    reset_tables(conn)
    delete_projects(conn)
    reload_project2datafile(conn)
    fix_mediatypes(conn)

if __name__ == "__main__":
    main()
