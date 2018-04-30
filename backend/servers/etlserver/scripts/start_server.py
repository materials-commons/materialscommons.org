#! /usr/bin/env python
import signal
import logging
import os
from os import environ
import sys
print(os.path.abspath('..'))
sys.path.append(os.path.abspath('..'))
if __name__ == "__main__" and __package__ is None:
    __package__ = "etlserver.scripts"
from ..user import access, apikeydb
from ..etl_api_app import app

_HOST = environ.get('MC_SERVICE_HOST') or 'localhost'
_PORT = environ.get('MC_ETL_SERVICE_PORT')


# noinspection PyUnusedLocal
def reload_users(signum, frame):
    apikeydb.reset()
    access.reset()


if __name__ == '__main__':
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    log = logging.getLogger("etl_server_app: start_server")
    if not _PORT:
        log.error("Environment missing MC_ETL_SERVICE_PORT; can not run server; quitting")
        exit(-1)

    signal.signal(signal.SIGHUP, reload_users)
    log.info("Starting ELT SERVER with host = {} and port = {}".format(_HOST, _PORT))
    app.run(debug=True, host=_HOST, port=int(_PORT), processes=5)
