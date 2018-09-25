import os
import logging

from ..database.DB import DbConnection
from globus_sdk.exc import GlobusAPIError
from globus_sdk import TransferAPIError


class VerifySetup:
    def __init__(self, mc_globus_service, project_id,
                 globus_source_endpoint, globus_source_path,
                 globus_destination_path, base_path, dir_file_list):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.mc_globus_service = mc_globus_service
        self.project_id = project_id
        self.globus_source_endpoint = globus_source_endpoint
        self.globus_source_path = globus_source_path
        self.globus_destination_path = globus_destination_path
        self.base_path = base_path
        self.dir_file_list = dir_file_list
        self.log.info("VerifySetup init: ")
        self.log.info("  project_id = {}".format(project_id))
        self.log.info("  globus_source_endpoint = {}".format(globus_source_endpoint))
        self.log.info("  globus_source_path = {}".format(globus_source_path))
        self.log.info("  base_path = {}".format(base_path))
        self.log.info("  dir_file_list = {}".format(dir_file_list))

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.target_endpoint = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')

        self.error_status = {}

    def status(self):
        self.error_status = {}

        try:
            self.check_env_variables()
            if not self.error_status:
                self.check_project_exists()
                self.check_target_directory()
                self.check_globus_clients()
                self.check_users_source_paths()
                self.check_acl_rule()
        except BaseException as e:
            self.error_status["exception"] = e

        if self.error_status:
            self.log.info("Completed status: Error = {}".format(self.error_status))
            return {
                'messages': self.error_status,
                'status': 'ERROR'
            }

        self.log.info("Completed status: Success")
        return {'status': 'SUCCESS'}

    def check_env_variables(self):

        if (not self.client_user) or (not self.client_token) or (not self.target_endpoint):
            missing = []
            if not self.client_user:
                missing.append('MC_CONFIDENTIAL_CLIENT_USER')
            if not self.client_token:
                missing.append('MC_CONFIDENTIAL_CLIENT_PW')
            if not self.target_endpoint:
                missing.append("MC_CONFIDENTIAL_CLIENT_ENDPOINT")
            message = "Missing environment values: {}".format(", ".join(missing))
            self.log.info(message)
            self.error_status["env"] = message
        else:
            self.log.info("MC_CONFIDENTIAL_CLIENT_USER, self.client_user, is {}".format(self.client_user))
            self.log.info("MC_CONFIDENTIAL_CLIENT_ENDPOINT, self.target_endpoint, is {}".format(self.target_endpoint))
            self.log.info("environment variables setup - ok")
        self.log.info("Completed check_env_variables")

    def check_project_exists(self):
        conn = DbConnection().connection()
        r = DbConnection().interface()
        proj = r.table('projects').get(self.project_id).run(conn)
        if not proj:
            self.log.info("project not found: {}".format(self.project_id))
            self.error_status["project_id"] = "project not found: " + self.project_id
        else:
            self.log.info("found project '{}'".format(proj['name']))
        self.log.info("Completed check_project_exists")

    def check_target_directory(self):
        if os.path.isdir(self.base_path):
            message = "transfer server directory: already exists - " + self.base_path
            self.log.info(message)
            self.error_status["target_directory"] = message
        else:
            self.log.info("transfer server directory ok: {}".format(self.base_path))
        self.log.info("Completed check_target_directory")

    def check_globus_clients(self):
        try:
            self.mc_globus_service.setup_transfer_clients()
        except GlobusAPIError as e:
            http_status = e.http_status
            code = e.code
            details = e.message
            message = "transfer service unavailable: "
            message += " http_status = " + str(http_status)
            message += ", code = " + code
            message += ", message = " + details
            self.error_status[code] = message
            self.log.info(message)
            return

        user_transfer_client = self.mc_globus_service.user_transfer_client

        try:
            user_transfer_client.endpoint_autoactivate(self.globus_source_endpoint)
            listing = user_transfer_client.operation_ls(self.globus_source_endpoint, path=self.globus_source_path)
        except TransferAPIError as err:
            self.log.error('Error [{}]: {}'.format(err.code, err.message))
            return

        file_list = [e for e in listing if e['type'] == 'file']
        self.log.info("File list = {}".format(file_list))

        ep = user_transfer_client.get_endpoint(self.globus_source_endpoint)
        self.log.info("Endpoint - display_name = {}".format(ep['display_name']))
        self.log.info("Endpoint - owner_string = {}".format(ep['owner_string']))

        # confirm target and inbound endpoints
        target_endpoint = user_transfer_client.get_endpoint(self.target_endpoint)
        inbound_endpoint = user_transfer_client.get_endpoint(self.globus_source_endpoint)

        self.log.info("Confirm endpoints: target_endpoint = {}, inbound_endpoint {}".
                      format(target_endpoint, inbound_endpoint))

        if not target_endpoint or not inbound_endpoint:
            if not target_endpoint:
                message = "Materials Commons staging endpoint: " + self.target_endpoint
                self.error_status["Missing target endpoint"] = message
                self.log.info(message)

            if not inbound_endpoint:
                message = "User's endpoint" + self.globus_source_endpoint
                self.error_status["Missing source endpoint"] = message
                self.log.info(message)

            return

        self.log.info("Completed check_globus_clients")
        return

    def check_users_source_paths(self):
        for path in self.dir_file_list:
            if not self.find_user_path(path):
                message = "User's endpoint data not found, {}".format(path)
                self.error_status["Missing data"] = message
                self.log.info(message)
        self.log.info("Completed check_users_source_paths")

    def find_user_path(self, end_path):
        try:
            self.mc_globus_service.set_transfer_client()
            transfer = self.mc_globus_service.transfer_client
            entry = os.path.split(end_path)[-1]
            path = os.path.normpath(os.path.join(end_path, os.path.pardir))
            content = transfer.operation_ls(self.globus_source_endpoint, path=path)
            for element in content:
                if element['name'] == entry:
                    return True
            self.log.info("Missing entry in content, entry = {}, content={}".format(entry, content))
            return
        except GlobusAPIError:
            self.log.exception("unexpected exception")
            return

    def check_acl_rule(self):
        acl = self.mc_globus_service.get_user_access_rule(self.globus_destination_path)
        if not acl:
            message = "Could find access Control Rule on materials commons endpoint for {}".\
                format(self.globus_destination_path)
            self.error_status["Missing acl"] = message
        else:
            self.log.info("Fouund ACL Rule for {}".format(self.globus_destination_path))
        self.log.info("Completed check_acl_rule")
