import logging
import os

_HOST = os.environ.get('MC_SERVICE_HOST') or 'localhost'
_PORT = os.environ.get('MC_GLOBUS_AUTH_SERVICE_PORT') or 5880
_MC_CC_ID = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
_MC_CC_PW = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')

def main():
    log = logging.getLogger("etl_server_app: start_server")
    if not _PORT:
        log.error("Environment variable missing MC_ETL_SERVICE_PORT; can not run server; quitting")
        exit(-1)
    if not _MC_CC_ID:
        log.error("Environment variable missing MC_CONFIDENTIAL_CLIENT_USER; can not run server; quitting")
        exit(-1)
    if not _MC_CC_PW:
        log.error("Environment variable missing MC_CONFIDENTIAL_CLIENT_PW; can not run server; quitting")
        exit(-1)

    log.info("Starting ELT SERVER with host = {} and port = {}".format(_HOST, _PORT))
    app.run(debug=True, host=_HOST, port=int(_PORT),
            ssl_context=('/Users/weymouth/.ssh/globus-server-ssl/server.crt',
                         '/Users/weymouth/.ssh/globus-server-ssl/server.key'),
            processes=1)


if __name__ == '__main__':
    from servers.etlserver.utils.LoggingHelper import LoggingHelper
    from servers.globusauthserver.app import app

    LoggingHelper().set_root()
    main()
