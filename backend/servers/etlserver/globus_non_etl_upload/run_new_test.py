import logging
import sys
import argparse
import time
from random import randint

from materials_commons.api import create_project
from globus_sdk.exc import GlobusAPIError

from .Upload import Upload
from ..common.access_exceptions import ProbeException, TransferFailed


class TestProject:
    def __init__(self):
        project_name = self.fake_name("TestProject-")
        project_description = "Generated test project - " + project_name
        self.project = create_project(project_name, project_description)

    def get_project(self):
        return self.project

    @classmethod
    def fake_name(cls, prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number


def main(project, endpoint):
    main_log = logging.getLogger("main")
    main_log.info("Starting all file Globus upload. Project = {} ({})".
                  format(project.name, project.id))
    main_log.info("... Globus endpoint id = {}".format(endpoint))
    try:
        main_log.info("Starting upload")
        upload = Upload(project.owner, project.id, endpoint)
        upload.setup_and_verify()
        transfer_id = str(int(time.time() * 1000))
        upload.start_transfer(transfer_id)
        while upload.is_transfer_running():
            time.sleep(5)
            main_log.info("In-line monitoring of upload: {}".format(upload.get_last_transfer_status()))
        main_log.info("Final status = {}".format(upload.get_last_transfer_status()))
        if not upload.get_last_transfer_status() == 'SUCCEEDED':
            raise TransferFailed("End of transfer status = {}".format(upload.get_last_transfer_status()))
        main_log.info("Moving data to project: {}".format(project.name))
        upload.move_data_dir_to_project()
        main_log.info("Done.")
        main_log.info("Done.")
    except GlobusAPIError as error:
        http_status = error.http_status
        code = error.code
        details = error.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        main_log.error(message)
        main_log.exception(error)
    except ProbeException as upload_error:
        main_log.exception(upload_error)


if __name__ == "__main__":

    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    startup_log = logging.getLogger("main-setup")

    # suppress info logging for globus_sdk loggers that are invoked, while leaving my info logging in place
    logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                   'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                   'globus_sdk.transfer.paging', 'globus_sdk.config', 'globus_sdk.exc',
                   'globus_sdk.transfer.data', 'globus_sdk.auth', 'globus_sdk.authorizers',
                   'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient',
                   'urllib3.connectionpool']
    for name in logger_list:
        logging.getLogger(name).setLevel(logging.ERROR)

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test of Globus non-ETL upload')
    parser.add_argument('--endpoint', type=str, help="Globus shared endpoint id")
    args = parser.parse_args(argv[1:])

    if not args.endpoint:
        print("You must specify a globus shared endpoint. Argument not found.")
        parser.print_help()
        exit(-1)

    project = TestProject().get_project()

    startup_log.info("args: endpoint = {}".format(args.endpoint))
    startup_log.info("generated test project - name = {}; id = {}".
                     format(project.name, project.id))

    main(project, args.endpoint)