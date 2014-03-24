#!/usr/bin/env python

from mcapi.mcapp import app
from mcapi import tservices, public, utils, private, access, process, machine, template, sample
from mcapi.user import account, datadirs, datafiles, reviews, ud, usergroups, projects, conditions, drafts
from mcapi.stater import stater
import sys
from os import environ
import optparse

_HOST = environ.get('MC_SERVICE_HOST') or 'localhost'

if __name__ == '__main__':
    parser = optparse.OptionParser()
    parser.add_option("-p", "--port", dest="port",
                      help="Port to run on", default=5000)
    (options, args) = parser.parse_args()
    app.run(debug=True, host=_HOST, port=int(options.port))
