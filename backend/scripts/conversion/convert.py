#!/usr/bin/env python
#
# This script converts the current production database to the new
# database layout.
#

import rethinkdb as r
from optparse import OptionParser
import os
import os.path
import magic
import sys


def msg(s):
    print s
    sys.stdout.flush()


def update_fullnames_and_last_login(conn):
    selection = r.table('users').run(conn)
    for user in selection:
        r.table('users').get(user['id']).update({
            'fullname': user['email'],
            'last_login': r.time(2014, 01, 01, '+00:00')
        }).run(conn)


def cleanup_samples(conn):
    msg("Identifying bad samples...")
    samples = list(r.table('samples').run(conn))
    for sample in samples:
        sid = sample['id']
        if 'project_id' not in sample:
            msg("sample %s/%s doesn't have project_id" % (sample['name'], sid))
            count = r.table('projects2samples').get_all(sid, index='sample_id')\
                                               .count().run(conn)
            msg("  count for %s = %d" % (sample['name'], count))
            r.table('samples').get(sid).update({'project_id': ''}).run(conn)
            continue
        elif sample['project_id'] == "":
            count = r.table('projects2samples').get_all(sid, index='sample_id')\
                                               .count().run(conn)
            msg("  count for %s/%s = %d" % (sample['name'], sid, count))
            # r.table('samples').get(sid).delete().run(conn)
    msg("Done...")


def add_usesid(conn):
    msg("Adding missing usesid to files...")
    files = list(r.table('datafiles').run(conn))
    for f in files:
        if 'usesid' not in f:
            msg("  Adding usesid to %s" % (f['id']))
            r.table('datafiles').get(f['id']).update({'usesid': ''}).run(conn)
    msg("Done...")


def convert_groups(conn):
    msg("Converting groups...")
    users = list(r.table('users').pluck('id').run(conn))
    projects = list(r.table('projects').run(conn, time_format='raw'))
    access_by_owner = {}
    #
    # For each project get the owner and build the
    # access list for that projects owners. Some
    # redundancy in code, but conversion is only
    # happening once, so not too worried about the
    # performance impact.
    for project in projects:
        owner = project['owner']
        if owner not in access_by_owner:
            msg("  Determining access for projects owned by %s..." % (owner))
            access_by_owner[owner] = []
            groups = list(r.table('usergroups')
                          .filter({'owner': owner}).run(conn))
            for group in groups:
                for username in group['users']:
                    users = access_by_owner[owner]
                    if username not in users:
                        users.append(username)

    # Now that we have all the users go through the list
    # of projects and set up the access.
    for project in projects:
        owner = project['owner']
        msg("  Setting access for project %s" % (project['name']))
        for user in access_by_owner[owner]:
            access = {
                "user_id": user,
                "project_id": project['id'],
                "project_name": project['name'],
                "dataset": "",
                "permissions": "",
                "birthtime": r.now(),
                "mtime": r.now()
            }
            r.table('access').insert(access).run(conn)
    msg("Done...")


def add_preferences(conn):
    msg("Adding preferences field to users...")
    r.table('users').update({
        'preferences': {
            'tags': [], 'templates': []
        }
    }).run(conn)
    msg("Done...")


def add_tags(conn):
    msg("Adding tags to denorm table...")
    denorm_items = r.table('datadirs_denorm').run(conn)
    for item in denorm_items:
        files = []
        r.table('datadirs_denorm').get(item['id'])\
                                  .update({'tags': {}}).run(conn)
        files = item['datafiles']
        for file in files:
            df = r.table('datafiles').get(file['id']).run(conn)
            file['tags'] = {}
            file['mediatype'] = df['mediatype']['mime']
        r.table('datadirs_denorm').get(item['id'])\
                                  .update({'datafiles': files}).run(conn)
    msg("Done...")


def datafile_path(mcdir, datafile_id):
    pieces = datafile_id.split("-")
    return os.path.join(mcdir, pieces[1][0:2], pieces[1][2:4], datafile_id)


def add_mediatypes(conn, mcdir):
    all_mediatypes = {'application/msword': 'MS-Word',
                      'application/octet-stream': 'Binary',
                      'application/pdf': 'PDF',
                      'application/postscript': 'Postscript',
                      'application/vnd.ms-excel': 'MS-Excel',
                      'application/vnd.ms-powerpoint': 'MS-PowerPoint',
                      'application/x-dosexec': 'DOS',
                      'application/xml': 'XML',
                      'application/zip': 'ZIP',
                      'image/gif': 'GIF',
                      'image/jpeg': 'JPEG',
                      'image/png': 'PNG',
                      'image/tiff': 'TIFF',
                      'image/vnd.adobe.photoshop': 'Photoshop',
                      'image/x-ms-bmp': 'BMP',
                      'inode/x-empty': 'Empty',
                      'text/html': 'HTML',
                      'text/plain': 'Text',
                      'text/rtf': 'RTF',
                      'text/x-asm': 'ASM',
                      'text/x-c++': 'C++',
                      'unknown': 'Unknown',
                      'video/mpeg': 'MPEG Video',
                      'video/x-ms-asf': 'MS-ASF Video',
                      'Composite Document File V2 Document, No summary info': 'Composite'}
    msg("Adding mediatypes and sizes for files and projects...")
    # Determine media types for files
    # and update the statistics for the
    # types in the project
    projects = list(r.table('projects').run(conn))
    for project in projects:
        msg("  Determining mediatypes for project %s" % (project['name']))
        mediatypes = {}
        project_size = 0
        project_id = project['id']
        datadirs = list(r.table('project2datadir')
                        .get_all(project_id, index='project_id')
                        .eq_join("datadir_id", r.table('datadirs_denorm'))
                        .zip().run(conn))
        # for each file in each directory determine its
        # mediatype. Update the file entry, and track
        # the count of different file mediatypes.
        for d in datadirs:
            for f in d['datafiles']:
                df = r.table('datafiles').get(f['id'])\
                                         .run(conn, time_format='raw')
                dfid = df['id']
                project_size += df['size']
                if df['usesid'] != "":
                    dfid = df['usesid']
                path = datafile_path(mcdir, dfid)
                if not os.path.isfile(path):
                    mime = "unknown"
                    mime_description = "Unknown"
                    msg("file not found: %s" % (path))
                else:
                    mime = magic.from_file(path, mime=True)
                    mime_description = magic.from_file(path)
                description = all_mediatypes[mime]
                msg("file %s has mediatype %s" % (path, mime))
                m = {
                    'mime': mime,
                    'mime_description': mime_description,
                    'description': description
                }
                r.table('datafiles').get(df['id'])\
                                    .update({'mediatype': m})\
                                    .run(conn)
                if mime not in mediatypes:
                    mediatypes[mime] = {
                        'count': 1,
                        'size': df['size'],
                        'description': all_mediatypes[mime]
                    }
                    msg("Unknown media type mapping: '%s'" % (mime))
                else:
                    mediatypes[mime] = {
                        'count': mediatypes[mime]['count'] + 1,
                        'size': mediatypes[mime]['size'] + df['size'],
                        'description': all_mediatypes[mime]
                    }
            # update datadirs_denorm to include mediatype
            r.table('datadirs_denorm').get(d['id']).update(d).run(conn)
        # update project with count
        r.table('projects').get(project_id)\
                           .update({'mediatypes': mediatypes, 'size': project_size})\
                           .run(conn)
    msg("Done...")


def add_shares_to_projects(conn):
    msg("Adding shares to projects...")
    projects = list(r.table('projects').run(conn))
    for proj in projects:
        msg(" Adding shares to project %s" % (proj['name']))
        mysamples = list(r.table('samples')
                         .get_all(proj['id'], index='project_id')
                         .run(conn, time_format='raw'))
        mysamples_ids_list = []
        for s in mysamples:
            mysamples_ids_list.append(s['id'])
        if mysamples_ids_list:
            potentially_shared = list(r.table('projects2samples')
                                      .get_all(*mysamples_ids_list, index='sample_id')
                                      .eq_join('sample_id', r.table('samples'))
                                      .map(lambda row: row.merge({
                                          "right": {
                                              "other_project_id": row["right"]["project_id"]
                                          }
                                      }))
                                      .without({"right": {"project_id": True}})
                                      .zip()
                                      .run(conn, time_format='raw'))
        else:
            potentially_shared = []
        proj['shares'] = get_project_shares(potentially_shared, proj['id'], conn)
        potentially_uses = list(r.table('projects2samples')
                                .get_all(proj['id'], index='project_id')
                                .eq_join('sample_id', r.table('samples'))
                                .map(lambda row: row.merge({
                                    "right": {
                                        "other_project_id": row["right"]["project_id"]
                                    }
                                }))
                                .without({"right": {"project_id": True}})
                                .zip()
                                .run(conn, time_format='raw'))
        proj['uses'] = get_project_uses(potentially_uses, proj['id'], conn)
        r.table('projects').get(proj['id']).update(proj).run(conn)
    msg("Done...")


def get_project_shares(all_samples_used, project_id, conn):
    """Finds all the samples that this project shares out"""
    shares = []
    for sample in all_samples_used:
        if sample['other_project_id'] == project_id \
           and sample['project_id'] != project_id:
            project = r.table('projects').get(sample['project_id'])\
                                         .run(conn, time_format='raw')
            if project is None:
                continue
            shared = {}
            shared['sample_name'] = sample['name']
            shared['sample_id'] = sample['id']
            shared['project_name'] = project['name']
            shared['project_id'] = project['id']
            shares.append(shared)
    return shares


def get_project_uses(all_samples_used, project_id, conn):
    """Finds all the samples that this project uses from other projects"""
    uses = []
    for sample in all_samples_used:
        if sample['project_id'] == project_id \
           and sample['other_project_id'] != project_id:
            project = r.table('projects').get(sample['other_project_id'])\
                                         .run(conn, time_format='raw')
            if project is None:
                continue
            shared = {}
            shared['sample_name'] = sample['name']
            shared['sample_id'] = sample['id']
            shared['project_name'] = project['name']
            shared['project_id'] = project['id']
            uses.append(shared)
    return uses


def add_default_tags(conn):
    msg("Adding default tags to users table...")
    r.table('users').update({'preferences': {
        'tags': [
            {
                "color": "#F4D03F",
                "description": "",
                "icon": "asterisk",
                "name": "priority"
            },
            {
                "color": "#5C97BF",
                "description": "",
                "icon": "eye",
                "name": "explore"
            },
            {
                "color": "#CF000F",
                "description": "",
                "icon": "exclamation",
                "name": "important"
            },
            {
                "color": "#1BBC9B",
                "description": "",
                "icon": "thumbs-up",
                "name": "success"
            },
            {
                "color": "#D2527F",
                "description": "",
                "icon": "thumbs-down",
                "name": "failed"
            }
        ]}}).run(conn)


def add_todos(conn):
    msg("Adding todos to the projects table...")
    r.table('projects').update({'todos': []}).run(conn)


def move_samples_denorm(conn):
    denorm = list(r.table('samples_denorm').run(conn))
    for row in denorm:
        msg(" Adding row  %s" % (row['id']))
        r.table('processes2samples').insert(row).run(conn)
    msg("Done inserting rows into new table")


def drop_unused_tables(conn):
    msg("Dropping unused tables: state")
    r.table_drop('state').run(conn)


def associate_samples_to_projects(conn):
    proj = r.table('projects').get('a46580f0-e4d0-4bda-b0a3-0bd4c27f1185')\
                              .run(conn)
    if proj:
        msg("project 1....")
        r.table('samples').get('9f40aec6-407a-41fd-a8e3-4589546526e3')\
                          .update({'project_id': proj['id']}).run(conn)
        r.table('projects2samples').insert({
            'project_id': proj['id'],
            'project_name': proj['name'],
            'sample_id': '9f40aec6-407a-41fd-a8e3-4589546526e3'
        }).run(conn)

    proj = r.table('projects').get('39f5ae68-5155-4646-8adb-c7244ba95a14')\
                              .run(conn)
    if proj:
        msg("project 2....")
        r.table('samples').get('a6671de2-e54a-4763-a600-edd9a8550fc9').update({
            'project_id': proj['id']
        }).run(conn)
        r.table('projects2samples').insert({
            'project_id': proj['id'],
            'project_name': proj['name'],
            'sample_id': 'a6671de2-e54a-4763-a600-edd9a8550fc9'
        }).run(conn)

    proj = r.table('projects').get('b736da86-4b69-4a94-95d8-48ead1d34edb')\
                              .run(conn)
    if proj:
        msg("project 3....")
        r.table('samples').get('ca6798bc-cb26-4e45-8c1a-48f37adae576').update({
            'project_id': proj['id']
        }).run(conn)
        r.table('projects2samples').insert({
            'project_id': proj['id'],
            'project_name': proj['name'],
            'sample_id': 'ca6798bc-cb26-4e45-8c1a-48f37adae576'
        }).run(conn)

    proj = r.table('projects').get('e0f04518-c143-4cc1-a183-42679d822adc')\
                              .run(conn)
    if proj:
        msg("project 4....")
        r.table('samples').get('a0757a27-1c92-49aa-b4ad-b323e3f06b40').update({
            'project_id': proj['id']
        }).run(conn)
        r.table('projects2samples').insert({
            'project_id': proj['id'],
            'project_name': proj['name'],
            'sample_id': 'a0757a27-1c92-49aa-b4ad-b323e3f06b40'
        }).run(conn)

    proj = r.table('projects').get('b736da86-4b69-4a94-95d8-48ead1d34edb')\
                              .run(conn)
    if proj:
        msg("project 5....")
        r.table('samples').get('489462d8-f047-4b7d-808f-f8f23c6c218b').update({
            'project_id': proj['id']
        }).run(conn)
        r.table('projects2samples').insert({
            'project_id': proj['id'],
            'project_name': proj['name'],
            'sample_id': '489462d8-f047-4b7d-808f-f8f23c6c218b'
        }).run(conn)

    proj = r.table('projects').get('a46580f0-e4d0-4bda-b0a3-0bd4c27f1185')\
                              .run(conn)
    if proj:
        msg("project 6....")
        r.table('samples').get('62d13c6e-1064-4936-9e63-dfc000aea250').update({
            'project_id': proj['id']
        }).run(conn)
        r.table('projects2samples').insert({
            'project_id': proj['id'],
            'project_name': proj['name'],
            'sample_id': '62d13c6e-1064-4936-9e63-dfc000aea250'
        }).run(conn)

    proj = r.table('projects').get('b736da86-4b69-4a94-95d8-48ead1d34edb')\
                              .run(conn)
    if proj:
        msg("project 7....")
        r.table('samples').get('6f36b073-f6a3-4316-a0a4-d222f48ca004').update({
            'project_id': proj['id']
        }).run(conn)
        r.table('projects2samples').insert({
            'project_id': proj['id'],
            'project_name': proj['name'],
            'sample_id': '6f36b073-f6a3-4316-a0a4-d222f48ca004'
        }).run(conn)


def mark_bad_projects(conn):
    # Marks projects as ready to be deleted

    # FeCr RIS
    r.table('projects').get('a46580f0-e4d0-4bda-b0a3-0bd4c27f1185')\
                       .update({'owner': 'delete@materialscommons.org'})\
                       .run(conn)

    # EBSD
    r.table('projects').get('469ccea2-d0d1-47a0-be8f-20bbcbb7b3e8')\
                       .update({'owner': 'delete@materialscommons.org'})\
                       .run(conn)

    # WE43 Heat Treatments
    r.table('projects').get('904886a7-ea57-4de7-8125-6e18c9736fd0')\
                       .update({'owner': 'delete@materialscommons.org'})\
                       .run(conn)

    # WE43
    r.table('projects').get('aa1f48c7-b280-4147-b724-733af16f04f6')\
                       .update({'owner': 'delete@materialscommons.org'})\
                       .run(conn)

    # Research
    r.table('projects').get('0af29f37-1148-4190-8e5e-86a9e74abf1d')\
                       .update({'owner': 'delete@materialscommons.org'})\
                       .run(conn)

    # HPDC
    r.table('projects').get('630891b1-db46-403f-89e1-245a874a1247')\
                       .update({'owner': 'delete@materialscommons.org'})\
                       .run(conn)

    # Test_Proj
    r.table('projects').get('c33edab7-a65f-478e-9fa6-9013271c73ea')\
                       .update({'owner': 'delete@materialscommons.org'})\
                       .run(conn)


def remove_conditions(conn):
    r.table('conditions').delete(conn)


def remove_processes(conn):
    r.table('processes').delete(conn)
    r.table('processes2samples').delete(conn)


def remove_reviews(conn):
    r.table('reviews').delete(conn)


def build_notes(conn):
    r.table('notes').delete().run(conn)
    # project notes
    projects = r.table('projects').pluck('notes', 'id').run(conn)
    for project in projects:
        notes = project['notes']
        # insert into notes table
        if len(notes) != 0:
            for each_note in notes:
                now = r.now()
                r.table('notes').insert({
                    'item_id': project['id'],
                    'item_type': 'project',
                    'creator': each_note['who'],
                    'note': each_note['message'],
                    'title': each_note['title'],
                    'birthtime': now,
                    'mtime': now,
                    'project_id': project['id']
                }).run(conn)
    # sample notes
    samples = r.table('samples').pluck('notes', 'id', 'project_id').run(conn)
    for sample in samples:
        notes = sample['notes']
        # insert into notes table
        if len(notes) != 0 and 'project_id' in sample:
            for each_note in notes:
                now = r.now()
                r.table('notes').insert({
                    'item_id': sample['id'],
                    'item_type': 'sample',
                    'creator': each_note['who'],
                    'note': each_note['message'],
                    'title': each_note['message'],
                    'birthtime': now,
                    'mtime': now,
                    'project_id': sample['project_id']
                }).run(conn)


def populate_elements(conn):
    # read elements.txt file and iterate throught each element to build
    # table rows
    lines = [line.rstrip('\n') for line in open('elements.txt')]
    r.table('elements').delete().run(conn)
    for line in lines:
        x = line.split('\t', 1)
        r.table('elements').insert({'name': x[0], 'full_name': x[1]}).run(conn)


def delete_old_drafts(conn):
    r.table('drafts').delete().run(conn)


def fix_or_delete_samples(conn):
    samples = list(r.table("samples")
                   .filter({"owner": "admin@materialscommons.org"})
                   .run(conn))
    for sample in samples:
        proj = r.table("projects").get(sample["project_id"]).run(conn)
        if proj is not None:
            r.table("samples").get(sample["id"]).update({
                "owner": proj["owner"]
            }).run(conn)
        else:
            # Sample belongs to a non-existent project: delete it.
            r.table("samples").get(sample["id"]).delete().run(conn)

#New Conversion
def update_mtime_samples():
    samples = list(r.table("samples").run(conn))
    for sample in samples:
            r.table("samples").get(sample["id"]).update({
                "mtime": sample["birthtime"]
            }).run(conn)


def main(conn, mcdir):
    msg("Beginning conversion steps:")
    mark_bad_projects(conn)
    remove_conditions(conn)
    remove_processes(conn)
    convert_groups(conn)
    delete_old_drafts(conn)
    add_preferences(conn)
    add_usesid(conn)
    add_mediatypes(conn, mcdir)
    cleanup_samples(conn)
    add_shares_to_projects(conn)
    add_tags(conn)
    add_default_tags(conn)
    add_todos(conn)
    drop_unused_tables(conn)
    move_samples_denorm(conn)
    associate_samples_to_projects(conn)
    populate_elements(conn)
    update_fullnames_and_last_login(conn)
    build_notes(conn)
    fix_or_delete_samples(conn)
    update_mtime_samples(conn)
    msg("Finished.")

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    parser.add_option("-d", "--directory", dest="mcdir", type="string",
                      help="mcdir location")
    (options, args) = parser.parse_args()
    if options.mcdir is None:
        print "You must specify the location of mcdir"
        sys.exit(1)
    conn = r.connect('localhost', options.port, db='materialscommons')
    main(conn, options.mcdir)
