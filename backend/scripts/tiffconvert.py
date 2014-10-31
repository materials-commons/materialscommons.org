#!/usr/bin/env python
from PIL import Image
import rethinkdb as r
from optparse import OptionParser
import sys
import os
import errno
import traceback


def datafile_dir(mcdir, datafile_id):
    pieces = datafile_id.split("-")
    return os.path.join(mcdir, pieces[1][0:2], pieces[1][2:4])


def mkdirp(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


def convert_image(f):
    if f["mediatype"]["mime"] == "image/tiff":
        return True
    elif f["mediatype"]["mime"] == "image/x-ms-bmp":
        return True
    else:
        return False


def main():
    parser = OptionParser()
    parser.add_option("-d", "--directory", dest="dir",
                      help="MCDIR location", type="string")
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port")
    (options, args) = parser.parse_args()

    if options.port is None:
        print "You must specify a port for RethinkDB."
        sys.exit(1)

    if options.dir is None:
        print "You must specify the location of the MC file repository."
        sys.exit(1)

    conn = r.connect('localhost', options.port, db='materialscommons')
    all_files = list(r.table('datafiles')
                     .get_all("image/tiff", "image/x-ms-bmp", index="mime")
                     .run(conn))
    for datafile in all_files:
        # print "File: %s" % (datafile['name'])
        filedir = datafile_dir(options.dir, datafile['id'])
        image_file = os.path.join(filedir, datafile['id'])
        conversion_dir = os.path.join(filedir, ".conversion")
        converted_file_path = os.path.join(conversion_dir,
                                           datafile['id'] + ".jpg")
        if 'usesid' in datafile and datafile['usesid'] != "":
            continue
        print "  Opening: %s" % (image_file)
        try:
            im = Image.open(image_file)
        except:
            traceback.print_exc()
            continue

        if os.path.isfile(converted_file_path):
            continue
        mkdirp(conversion_dir)
        if im.mode != 'RGB':
            im = im.convert('RGB')
        print "Converting file %s, id %s" % (datafile['name'],
                                             datafile['id'])
        im.save(converted_file_path)

if __name__ == "__main__":
    main()
