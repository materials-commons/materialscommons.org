#!/usr/bin/env python
from os import environ
import optparse
import signal
import pkg_resources

from backend.etlserver import access, apikeydb
from backend.etlserver.etl_api_app import app

_HOST = environ.get('MC_SERVICE_HOST') or 'localhost'


def reload_users(signum, frame):
    apikeydb.reset()
    access.reset()


if __name__ == '__main__':
    parser = optparse.OptionParser()
    parser.add_option("-p", "--port", dest="port",
                      help="Port to run on", default=5032)
    (options, args) = parser.parse_args()
    signal.signal(signal.SIGHUP, reload_users)
    print("--- materials_commons version check ---")
    print(pkg_resources.get_distribution("materials_commons").version)
    print("--- materials_commons version check ---")
    app.run(debug=True, host=_HOST, port=int(options.port), processes=1)
