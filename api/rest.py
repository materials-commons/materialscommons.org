#!/usr/bin/env python

from mcapi.mcapp import app
from mcapi import tservices, public, utils, private, access, process, machine, template
from mcapi.user import account, datadirs, datafiles, reviews, ud, usergroups, projects
import sys

if __name__ == '__main__':
    if len(sys.argv) >= 2:
        debug = True
    else:
        debug = False

    if len(sys.argv) == 3:
        app.run(debug=debug, host='0.0.0.0')
    else:
        app.run(debug=debug)
