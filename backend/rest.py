#!/usr/bin/env python

from mcapi.mcapp import app
from mcapi import tservices, public, utils, private, access, process, machine, template, tservices
from mcapi.user import account, datadirs, datafiles, reviews, ud, usergroups, projects, conditions
from mcapi.stater import stater
import sys
from os import environ

_HOST = environ.get('MC_SERVICE_HOST') or 'localhost'
_PORT = environ.get('MC_SERVICE_PORT') or '5000'

if __name__ == '__main__':
    if len(sys.argv) >= 2:
        debug = True
    else:
        debug = False

    app.run(debug=debug, host=_HOST, port=int(_PORT))
