import os
import errno
import uuid
from pbkdf2 import crypt
from args import json_as_format_arg
import rethinkdb as r
import datetime


def mkdirp(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


_PW_ITERATIONS = 4000


def json_for_single_item_list(itemlist):
    if not itemlist:
        return json_as_format_arg({})
    else:
        return json_as_format_arg(itemlist[0])


def make_password_hash(password):
    salt = uuid.uuid1().hex
    return crypt(password, salt, iterations=_PW_ITERATIONS)


def make_salted_password_hash(password, salt):
    return crypt(password, salt, iterations=_PW_ITERATIONS)


def sort_by_count(l):
    return l['count']


def set_dates(item):
    tnow = r.now()
    item['birthtime'] = tnow
    item['mtime'] = tnow


def now_str():
    return datetime.datetime.now().strftime("%I:%M%p on %B %d, %Y")
