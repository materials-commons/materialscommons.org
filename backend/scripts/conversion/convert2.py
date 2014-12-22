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
import mimetypes


def msg(s):
    print s
    sys.stdout.flush()


def datafile_path(mcdir, datafile_id):
    pieces = datafile_id.split("-")
    return os.path.join(mcdir, pieces[1][0:2], pieces[1][2:4], datafile_id)


def remove_existing_mediatypes(conn):
    msg("Removing existing media type entries")
    r.table("datafiles").replace(r.row.without("mediatype")).run(conn)
    r.table("projects").replace(r.row.without("mediatypes")).run(conn)
    msg("Done...")


def add_mediatypes(conn, mcdir):
    remove_existing_mediatypes(conn)
    mimetypes.add_type("application/matlab", ".m", strict=False)

    mediatypes_mapping = {
        'text/xml': "XML",
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': "Spreadsheet",
        'image/jpeg': "JPEG",
        'application/postscript': "Postscript",
        'image/png': "PNG",
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': "Word",
        'application/json': "JSON",
        'image/vnd.ms-modi': "MS-Document Imaging",
        'application/vnd.ms-xpsdocument': "MS-Postscript",
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': "Presentation",
        'image/vnd.radiance': "Radiance",
        'application/vnd.sealedmedia.softseal.pdf': "Softseal PDF",
        'application/vnd.hp-PCL': "PCL",
        'Composite Document File V2 Document, No summary info': "Composite Document File",
        'application/xslt+xml': "XSLT",
        'image/gif': "GIF",
        'application/matlab': "matlab",
        'application/pdf': "PDF",
        'application/xml': "XML",
        'application/vnd.ms-excel': "MS-Excel",
        'image/bmp': "BMP",
        'image/tiff': "TIFF",
        'image/vnd.adobe.photoshop': "Photoshop",
        'application/pkcs7-signature': "PKCS",
        'image/vnd.dwg': "DWG",
        'application/vnd.ms-powerpoint.presentation.macroEnabled.12': "MS-PowerPoint",
        'application/octet-stream': "Binary",
        'application/rtf': "RTF",
        'text/plain': "Text",
        'application/vnd.ms-powerpoint': "MS-PowerPoint",
        'application/x-troff-man': "TROFF",
        'video/x-ms-wmv': "WMV Video",
        'application/vnd.chemdraw+xml': "ChemDraw",
        'text/html': "HTML",
        'video/mpeg': "MPEG Video",
        'text/csv': "CSV",
        'application/zip': "ZIP",
        'application/msword': "MS-Word"
    }
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
                mime, ignore = mimetypes.guess_type(df["name"], strict=False)
                description = None
                if mime is None:
                    msg("mimetypes couldn't guess type for %s" % (df["name"]))
                    path = datafile_path(mcdir, dfid)
                    if not os.path.isfile(path):
                        mime = "unknown"
                        description = "Unknown"
                        msg("file not found: %s" % (path))
                    else:
                        mime = magic.from_file(path, mime=True)

                if description is None:
                    if mime not in mediatypes_mapping:
                        description = "Unmapped type: %s" % (mime)
                    else:
                        description = mediatypes_mapping[mime]
                m = {
                    'mime': mime,
                    'description': description
                }
                r.table('datafiles').get(df['id'])\
                                    .update({'mediatype': m})\
                                    .run(conn)
                if mime not in mediatypes:
                    mediatypes[mime] = {
                        'count': 1,
                        'size': df['size'],
                        'description': description
                    }
                else:
                    mediatypes[mime] = {
                        'count': mediatypes[mime]['count'] + 1,
                        'size': mediatypes[mime]['size'] + df['size'],
                        'description': description
                    }
            # update datadirs_denorm to include mediatype
            r.table('datadirs_denorm').get(d['id']).update(d).run(conn)
        # update project with count
        r.table('projects').get(project_id)\
                           .update({
                               'mediatypes': mediatypes,
                               'size': project_size
                           }).run(conn)
    msg("Done...")


def drop_table(table_name, conn):
    try:
        msg("Dropping table %s" % (table_name))
        r.table_drop(table_name).run(conn)
    except Exception as e:
        msg("Failed to drop table %s: %s" % (table_name, str(e)))


def drop_unused_tables(conn):
    msg("Dropping unused tables...")
    drop_table("conditions", conn)
    drop_table('processes2samples', conn)
    drop_table("datafiles_denorm", conn)
    drop_table("items2tags", conn)
    drop_table("processes2samples", conn)
    drop_table("samples_denorm", conn)
    drop_table("treatments", conn)
    msg("Done...")


def load_tags(conn):
    msg("Loading tags...")
    users = list(r.table("users").run(conn))
    for user in users:
        projects = list(r.table("projects")
                        .get_all(user['id'], index="owner")
                        .run(conn))
        for project in projects:
            tags = []
            for tag in user["preferences"]["tags"]:
                tags.append({
                    "name": tag["name"],
                    "color": tag["color"],
                    "icon": tag["icon"],
                    "description": tag["description"],
                    "project_id": project["id"],
                    "project_name": project["name"]
                })
            r.table("tags").insert(tags).run(conn)
        r.table("users").get(user["id"]).replace(r.row.without({
            "preferences": {
                "tags": True
            }
        })).run(conn)
    msg("Done...")


def load_sample2item(conn):
    msg("Mapping projects to samples...")
    all = list(r.table("projects2samples").run(conn))
    for p2s in all:
        s = r.table("samples").get(p2s['sample_id']).run(conn)
        r.table("sample2item").insert({
            "sample_id": p2s['sample_id'],
            "sample_name": s["name"],
            "item_id": p2s["project_id"],
            "item_name": p2s["project_name"],
            "item_type": "project"
        }).run(conn)
    msg("Done...")


def delete_tag_table_entries(conn):
    msg("Cleaning up old tag entries...")
    r.table("tags").delete().run(conn)
    r.table("tag2item").delete().run(conn)
    msg("Done...")


def update_mtime_samples(conn):
    msg("Adding mtime to samples")
    samples = list(r.table("samples").run(conn))
    for sample in samples:
            r.table("samples").get(sample["id"]).update({
                "mtime": sample["birthtime"]
            }).run(conn)
    msg("Done...")


def build_datadir2datafile(conn):
    msg("Building datadir2datafile table")
    datadirs = list(r.table("datadirs").run(conn))
    for dd in datadirs:
        dfs = [{"datadir_id": dd['id'], "datafile_id": dfid}
               for dfid in dd['datafiles']]
        r.table("datadir2datafile").insert(dfs).run(conn)
        r.table("datadirs").get(dd['id'])\
                           .replace(r.row.without("datafiles"))\
                           .run(conn)
    msg("Done...")


def main(conn, mcdir):
    msg("Beginning conversion steps:")
    # delete_tag_table_entries(conn)
    # load_sample2item(conn)
    # delete_tag_table_entries(conn)
    # load_tags(conn)
    # drop_unused_tables(conn)
    # add_mediatypes(conn, mcdir)
    # update_mtime_samples(conn)
    build_datadir2datafile(conn)
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
