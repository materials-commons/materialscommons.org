#!/usr/bin/env python
#
# This script determines the mediatype for files.
#

import rethinkdb as r
from optparse import OptionParser
import mimetypes
import magic
import os
import sys


def msg(s):
    print s
    sys.stdout.flush()


def datafile_path(mcdir, datafile_id):
    pieces = datafile_id.split("-")
    return os.path.join(mcdir, pieces[1][0:2], pieces[1][2:4], datafile_id)


def main(conn, mcdir):
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
    fcount = 0
    for project in projects:
        msg("  Determining mediatypes for project %s" % (project['name']))
        project_size = 0
        project_id = project['id']
        datafiles = list(r.table('project2datadir')
                         .get_all(project_id, index='project_id')
                         .eq_join("datadir_id",
                                  r.table('datadir2datafile'),
                                  index="datadir_id")
                         .zip()
                         .eq_join("datafile_id",
                                  r.table("datafiles"))
                         .zip()
                         .filter(lambda f: f["mediatype"].eq("").or_(
                             f["mediatype"]["mime"].eq("")))
                         .run(conn))
        file_count = len(datafiles)
        # for each file in each directory determine its
        # mediatype. Update the file entry, and track
        # the count of different file mediatypes.
        for df in datafiles:
            fcount = fcount+1
            dfid = df['id']
            msg("  Processing file: %s", df["name"])
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
            if mime not in project["mediatypes"]:
                project["mediatypes"][mime] = {
                    'count': 1,
                    'size': df['size'],
                    'description': description
                }
            else:
                project_count = project["mediatypes"][mime]["count"]
                project["mediatypes"][mime]["count"] = project_count+1
                project_size = project["mediatypes"][mime]["size"]
                project["mediatypes"][mime]["size"] = project_size + df['size']
        # update project with count
        r.table('projects').get(project_id)\
                           .update(project["mediatypes"])\
                           .run(conn)
    msg("Done...")


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
