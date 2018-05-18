#! /usr/bin/env python
import signal
import logging
import sys
from os import environ
from etlserver.access import reset as access_reset
from etlserver.apikeydb import reset as apikeydb_reset
from etlserver.etl_api_app import app

_HOST = environ.get('MC_SERVICE_HOST') or 'localhost'
_PORT = environ.get('MC_ETL_SERVICE_PORT')


# noinspection PyUnusedLocal
def reload_users(signum, frame):
    apikeydb_reset()
    access_reset()


def main():
    log = logging.getLogger("etl_server_app: start_server")
    if not _PORT:
        log.error("Environment missing MC_ETL_SERVICE_PORT; can not run server; quitting")
        exit(-1)

    signal.signal(signal.SIGHUP, reload_users)
    log.info("Starting ELT SERVER with host = {} and port = {}".format(_HOST, _PORT))
    app.run(debug=True, host=_HOST, port=int(_PORT), processes=5)


if __name__ == '__main__':
    root = logging.getLogger()
    root.setLevel(logging.WARNING)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.WARNING)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    main()
