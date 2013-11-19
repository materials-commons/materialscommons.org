import utils
from os import environ
import os.path


MCDIR = environ.get("MCDIR") or '/mcfs/data'


def for_uid(uidstr):
    pieces = uidstr.split('-')
    path = os.path.join(MCDIR, pieces[1][0:2], pieces[1][2:4])
    utils.mkdirp(path)
    return path
