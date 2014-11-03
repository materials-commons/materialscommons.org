#!/usr/bin/env python

from mcapi.mcapp import app
from mcapi import tservices, public, utils, private, access
from mcapi import process, machine, template, objects, doc
from mcapi.user import account, datadirs, datafiles, reviews
from mcapi.user import ud, usergroups, projects, conditions, drafts
from mcapi.user import provenance
from mcapi.stater import stater
from os import environ
import optparse
import signal
from mcapi import apikeydb

_HOST = environ.get('MC_SERVICE_HOST') or 'localhost'


def reload_users(signum, frame):
    apikeydb.reset()
    access.reset()

if __name__ == '__main__':
    parser = optparse.OptionParser()
    parser.add_option("-p", "--port", dest="port",
                      help="Port to run on", default=5000)
    (options, args) = parser.parse_args()

    signal.signal(signal.SIGHUP, reload_users)
    app.run(debug=True, host=_HOST, port=int(options.port))
