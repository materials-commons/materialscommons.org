import os, errno
import uuid
from pbkdf2 import crypt
from flask import jsonify, make_response
from args import json_as_format_arg
import rethinkdb as r

class Status:
    SUCCESS = 200
    FAILURE = 400
    USERGROUP_EXISTS = 401
    ACCOUNT_EXISTS = 402
    FORBIDDEN = 403
    TAG_PROBLEM = 404
    ACCESS_NOT_ALLOWED = 405

def createTagCount(selection):
    tagsByCount = []
    tagsCountDict = {}
    for tag in selection:
        if tag not in tagsCountDict:
            tagsCountDict[tag] = 1
        else:
            tagsCountDict[tag] = tagsCountDict[tag]+1
    for key in tagsCountDict.keys():
        tag = {}
        tag['name'] = key
        tag['count'] = tagsCountDict[key]
        tagsByCount.append(tag)
    return json_as_format_arg(tagsByCount)

def mkdirp(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise

_PW_ITERATIONS=4000

def json_for_single_item_list(itemlist):
    if not itemlist:
        return json_as_format_arg({})
    else:
        return json_as_format_arg(itemlist[0])

def makePwHash(password):
    salt = uuid.uuid1().hex
    return crypt(password, salt, iterations=_PW_ITERATIONS)

def makePwHashWithSalt(password, salt):
    return crypt(password, salt, iterations=_PW_ITERATIONS)

#def error_access_response():
    #make_response(jsonify({'error': 'access denied'}), 403)

#def error_not_found_response():
    #make_response(jsonify({'error': 'no such datafile'}), 404)

def error_response(code):
    error_dict = {
        400 : {'Bad Request'},
        403:  {'Access Denied'},
        418 : {'error': 'Login Failed. Please check the Username & Password'},
        419 : {'error': 'Update Failed. Please check the entries and try again'},
        420 : {'error': 'Reset Failed. Unable to reset apikey'},
        421 : {'error': 'Failed: Entry already exists'},
        422 : {'error': 'No entry in the database'},
        423 : {'error': 'Failed: Unable to add the entity to database'}
    }
    return make_response(jsonify(error_dict[code]), code)

def set_dates(item):
    tnow = r.now()
    item['birthtime'] = tnow
    item['mtime'] = tnow
