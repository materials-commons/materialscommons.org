import argparse
import sys
import os
import logging
from random import randint

from globus_sdk.exc import GlobusAPIError
from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import TransferClient
from globus_sdk import TransferClient, TransferData, TransferAPIError

from materials_commons.api import get_all_projects


class GlobusDownload:
    def __init__(self, file_list, user_name):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info(" init - started")
        self.file_list = file_list
        self.transfer_client = None
        self.user_dir = None
        self.user_name = user_name

    def get_transfer_client(self):
        if self.transfer_client:
            return self.transfer_client

        client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        auth_client = ConfidentialAppAuthClient(
            client_id=client_user, client_secret=client_token)
        self.auth_client = auth_client
        scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
        cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
        self.transfer_client = TransferClient(authorizer=cc_authorizer)
        return self.transfer_client

    def download(self):
        self.stage()
        self.expose()

    def stage(self):
        self.log.info("Staging - start")
        mc_dirs = os.environ.get('MCDIR')
        mc_dir = mc_dirs.split(':')[0]
        self.log.info("Staging - mc dir = {}".format(mc_dir))
        staging_dir = '/Users/weymouth/working/MaterialsCommons/mcdir/__download_staging'
        self.user_dir = self.make_random_name('testing-')
        staging_dir = os.path.join(staging_dir, self.user_dir)
        self.log.info("Staging - staging dir = {}".format(staging_dir))
        self.log.info("Staging - user dir = {}".format(self.user_dir))
        os.makedirs(staging_dir)
        for file in self.file_list:
            p1 = file.id[9:11]
            p2 = file.id[11:13]
            file_path = os.path.join(mc_dir, p1, p2, file.id)
            link_path = os.path.join(staging_dir, file.name)
            os.link(file_path, link_path)
        self.log.info("Staging - end")

    def expose(self):
        self.log.info("Expose - start")
        transfer_client = self.get_transfer_client()
        ret = self.auth_client.get_identities(usernames=self.user_name)
        globus_user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            globus_user = ret['identities'][0]
        if not globus_user:
            raise RequiredAttributeException("Missing Globus user identity")
        self.log.info("Globus user = {}, id = {}".format(globus_user['name'], globus_user['id']))
        # materials_commons_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        download_ep_id = '84b62e46-5ebc-11e8-91d5-0a6d4e044368'
        confidential_client_endpoint = transfer_client.get_endpoint(download_ep_id)
        self.log.info("Expose - base ep = {}".format(confidential_client_endpoint['display_name']))
        for entry in transfer_client.operation_ls(download_ep_id,path=self.user_dir):
            self.log.info("  name = {}, type={}".format(entry['name'], entry['type']))
        acl_rule = {
            "DATA_TYPE": "access",
            "principal_type": "identity",
            "principal": globus_user['id'],
            "path": "/" + self.user_dir + "/",
            "permissions": "r"
        }
        results = transfer_client.add_endpoint_acl_rule(download_ep_id, acl_rule)
        if not (results and results['access_id']):
            raise AuthenticationException("Can not set access control rule for {} on {}".
                                          format(globus_user['name'], "/" + self.user_dir + "/"))
        self.log.info("Transfer enabled for {} ({})".format(globus_user['name'], globus_user['is']))
        self.log.info("    from ep: {} with directory {}".format(download_ep_id, self.user_dir))
        self.log.info("Expose - end")

    @staticmethod
    def make_random_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number

def main(project, user):
    main_log = logging.getLogger("main")
    main_log.info("Starting all file Globus upload. Project = {} ({})".
                  format(project.name, project.id))
    directory = project.get_top_directory()
    file_or_dir_list = directory.get_children()
    file_list = []
    for file_or_dir in file_or_dir_list:
        if file_or_dir.otype == 'file':
            file_list.append(file_or_dir)
    if not file_list:
        print("no files found in top level dir of project")
        exit(-1)
    main_log.info("Found {} files.".format(len(file_list)))
    try:
        download = GlobusDownload(file_list, user)
        download.download()
    except GlobusAPIError as error:
        http_status = error.http_status
        code = error.code
        details = error.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        main_log.error(message)


if __name__ == "__main__":
    # client = get_transfer_client()
    # print("client = {}".format(client))

    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    local_log = logging.getLogger("main-setup")

    # suppress info logging for globus_sdk loggers that are invoked, while leaving my info logging in place
    logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                   'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                   'globus_sdk.transfer.paging', 'globus_sdk.config', 'globus_sdk.exc',
                   'globus_sdk.transfer.data',
                   'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient',
                   'urllib3.connectionpool']
    for name in logger_list:
        logging.getLogger(name).setLevel(logging.ERROR)

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Check that Globus/ETL setup is working')
    parser.add_argument('--name', type=str, help="Project Name")
    parser.add_argument('--user', type=str, help="User's Globus ID")
    args = parser.parse_args(argv[1:])
    if not args.name:
        print("You must specify a unique project name, or name substring. Argument not found.")
        parser.print_help()
        exit(-1)

    if not args.user:
        print("You must specify a globus userid. Argument not found.")
        parser.print_help()
        exit(-1)

    local_log.info("Searching for project with name-match = {}".format(args.name))
    project_list = get_all_projects()

    project_selected = None
    for probe in project_list:
        if args.name in probe.name:
            if project_selected:
                print("Found multiple matches for {}".format(args.name))
                print("You must specify a unique project name, or name substring.")
                parser.print_help()
                exit(-1)
            project_selected = probe

    if not project_selected:
        print("Found no matches for {}".format(args.name))
        print("You must specify a unique project name, or name substring.")
        parser.print_help()
        exit(-1)

    local_log.info("Found match with name-match = {}; project.name = {}; id = {}".
                   format(args.name, project_selected.name, project_selected.id))

    main(project_selected, args.user)


class ProbeException(Exception):
    def __init__(self, attr):
        self.attr = str(attr)


class RequiredAttributeException(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)


class AuthenticationException(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)


class NoSuchItem(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)
