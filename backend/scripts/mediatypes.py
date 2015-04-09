#!/usr/bin/env python
#
# This script updates the mediatypes for new files.
#

import rethinkdb as r
from optparse import OptionParser
import os
import os.path
import magic
import mimetypes
import sys


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
    files = list(r.table('datafiles')
                 .get_all("", index='mime')
                 .run(conn))
    for f in files:
        fid = f['id']
        path = datafile_path(mcdir, fid)
        mime, ignore = mimetypes.guess_type(f["name"], strict=False)
        description = None
        if mime is None:
            if not os.path.isfile(path):
                mime = "unknown"
                description = "Unknown"
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
        r.table('datafiles').get(f['id'])\
                            .update({'mediatype': m})\
                            .run(conn)


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
