#!/usr/bin/env python
from os import environ
import optparse
import signal

import access, apikeydb
from mcglobusapi.globus_api_app import app

_HOST = environ.get('MC_SERVICE_HOST') or 'localhost'


def reload_users(signum, frame):
    apikeydb.reset()
    access.reset()

if __name__ == '__main__':
    parser = optparse.OptionParser()
    parser.add_option("-p", "--port", dest="port",
                      help="Port to run on", default=5042)
    (options, args) = parser.parse_args()
    signal.signal(signal.SIGHUP, reload_users)
    app.run(debug=True, host=_HOST, port=int(options.port), processes=1)
