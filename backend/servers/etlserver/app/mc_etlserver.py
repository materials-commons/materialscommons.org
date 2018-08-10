#! /usr/bin/env python
import os
import sys
import signal
import logging

# Note: after fooling around with modules and paths for a couple of days, I discovered
#  that the below conditional addition to sys.path, solved the problem with werkzeug
#  restarts in Flask - which, apparently, are for debugging only. Without these
#  two lines, the restart (for werkzeug monitoring) generates an error:
#  ModuleNotFoundError: No module named 'servers' - Terry - Aug 10, 2018
if not sys.path[0] == '':
    sys.path = [''] + sys.path

_HOST = os.environ.get('MC_SERVICE_HOST') or 'localhost'
_PORT = os.environ.get('MC_ETL_SERVICE_PORT')


# noinspection PyUnusedLocal
def reload_users(signum, frame):
    from servers.etlserver.user.access import reset as access_reset
    from servers.etlserver.user.apikeydb import reset as apikeydb_reset
    apikeydb_reset()
    access_reset()


signal.signal(signal.SIGHUP, reload_users)


def main():
    log = logging.getLogger("etl_server_app: start_server")
    if not _PORT:
        log.error("Environment missing MC_ETL_SERVICE_PORT; can not run server; quitting")
        exit(-1)

    log.info("Starting ELT SERVER with host = {} and port = {}".format(_HOST, _PORT))
    app.run(debug=True, host=_HOST, port=int(_PORT), processes=1)


if __name__ == '__main__':
    from servers.etlserver.utils.LoggingHelper import LoggingHelper
    from servers.etlserver.app.etl_api_app import app

    LoggingHelper().set_root()
    main()
