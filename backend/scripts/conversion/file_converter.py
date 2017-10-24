#!/usr/bin/env python
import mimetypes
import shutil
import tempfile

import rethinkdb as r
from optparse import OptionParser
import os
import errno
import sys

mcdirpaths = []


def convert_files(conn):
    print "Converting files..."
    for f in r.table('datafiles').run(conn):
        if is_image_to_convert(f):
            convert_image_if_needed(f)
        elif is_office_doc(f):
            convert_office_doc_if_needed(f)
    print "Done."


def is_image_to_convert(f):
    if f['mediatype']['mime'] == "image/tiff":
        return True
    elif f['mediatype']['mime'] == "image/x-ms-bmp":
        return True
    elif f['mediatype']['mime'] == "image/bmp":
        return True
    return False


def convert_image_if_needed(f):
    if converted_file_exists(f, "jpg"):
        return
    elif f['usesid'] != "":
        return
    ofile_path = originating_file_path(f)
    if ofile_path is None:
        print "Unknown file name: %s, id: %s" % (f['name'], f['id'])
        return
    ofile_mcdir = get_mcdir(ofile_path)
    mkdirp(conversion_dir_path_from(ofile_mcdir, f))
    command = "convert %s %s" % (originating_file_path(f), conversion_file_path_from(ofile_mcdir, f, "jpg"))
    print "Running command '%s'" % command
    sys.stdout.flush()
    os.system(command)


def get_mcdir(file_path):
    return os.path.dirname(os.path.dirname(os.path.dirname(file_path)))


def is_office_doc(f):
    if f['mediatype']['mime'] == "application/vnd.ms-excel":
        return True
    elif f['mediatype']['mime'] == "application/vnd.ms-powerpoint":
        return True
    elif f['mediatype']['mime'] == "application/msword":
        return True
    elif f['mediatype']['mime'] == "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return True
    elif f['mediatype']['mime'] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return True
    elif f['mediatype']['mime'] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return True
    return False


def convert_office_doc_if_needed(f):
    if converted_file_exists(f, "pdf"):
        return
    elif f['usesid'] != "":
        return

    ofile = originating_file_path(f)
    if ofile is None:
        print "Unknown file name: %s, id: %s" % (f['name'], f['id'])
        return

    ofile_mcdir = get_mcdir(ofile)
    conv_dir = conversion_dir_path_from(ofile_mcdir, f)
    pdir = tempfile.mkdtemp(dir="/tmp")
    converted_file_path = os.path.join("/tmp", os.path.basename(ofile) + ".pdf")
    mkdirp(conv_dir)
    cmd = "libreoffice -env:UserInstallation=file://%s --headless --convert-to pdf --outdir /tmp %s; cp %s %s; rm -f %s" % (
        pdir, ofile, converted_file_path, conv_dir, converted_file_path)
    print "Running command '%s'" % cmd
    sys.stdout.flush()
    os.system(cmd)
    shutil.rmtree(pdir)


def converted_file_exists(f, ext):
    for path_entry in mcdirpaths:
        file_path = conversion_file_path_from(path_entry, f, ext)
        if os.path.exists(file_path):
            return True
    return False


def conversion_dir_path_from(mcdir, f):
    fid = file_id(f)
    id_parts = fid.split("-")
    return os.path.join(mcdir, id_parts[1][0:2], id_parts[1][2:4], ".conversion")


def conversion_file_path_from(mcdir, f, ext):
    fid = file_id(f)
    conv_dir_path = conversion_dir_path_from(mcdir, f)
    return os.path.join(conv_dir_path, fid + "." + ext)


def originating_file_path(f):
    fid = f['id']
    id_parts = fid.split("-")
    for path_entry in mcdirpaths:
        p = os.path.join(path_entry, id_parts[1][0:2], id_parts[1][2:4], fid)
        if os.path.exists(p):
            return p


def file_id(f):
    if f['usesid'] != '':
        return f['usesid']
    return f['id']


def mkdirp(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


def fix_mediatypes(conn):
    print "Fixing mediatypes..."
    for f in r.table('datafiles').run(conn):
        if 'mediatype' not in f:
            mtype = mimetypes.guess_type(f['name'])
            r.db('materialscommons').table('datafiles').get(f['id']).update({
                'mediatype': {'description': 'None', 'mime': mtype[0]}
            }).run(conn)
    print "Done."


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)
    parser.add_option("-m", "--mcdir", dest="mcdir", type="string", help="mcdir path", default="/mcfs/data/test")
    (options, args) = parser.parse_args()
    print "RethinkDB port = " + str(options.port)
    print "MCDIR = " + options.mcdir
    conn = r.connect('localhost', options.port, db="materialscommons")
    mcdirpaths = options.mcdir.split(":")
    fix_mediatypes(conn)
    convert_files(conn)
