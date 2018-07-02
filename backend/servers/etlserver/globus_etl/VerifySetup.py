import os
import logging

from ..database.DB import DbConnection
from globus_sdk.exc import GlobusAPIError

class VerifySetup:
    def __init__(self, web_service, project_id, globus_endpoint, base_path,
                 excel_file_path, data_dir_path):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.web_service = web_service
        self.project_id = project_id
        self.globus_endpoint = globus_endpoint
        self.base_path = base_path
        self.excel_file_path = excel_file_path
        self.data_dir_path = data_dir_path
        self.error_status = {}

    def status(self):
        self.error_status = {}

        self.check_project_exists()
        self.check_target_directory()
        self.check_globus_clients()
        self.check_users_source_paths()

        if self.error_status:
            return {
                'messages': self.error_status,
                'status': 'ERROR'
            }
        return {'status': 'SUCCESS'}

    def check_project_exists(self):
        conn = DbConnection().connection()
        r = DbConnection().interface()
        proj = r.table('projects').get(self.project_id).run(conn)
        if not proj:
            self.log.info("project not found: {}".format(self.project_id))
            self.error_status["project_id"] = "project not found: " + self.project_id
        else:
            self.log.info("found project '{}'".format(proj['name']))

    def check_target_directory(self):
        if os.path.isdir(self.base_path):
            message = "transfer server directory: already exists - " + self.base_path
            self.log.info(message)
            self.error_status["target_directory"] = message
        else:
            self.log.info("transfer server directory ok: {}".format(self.base_path))

    def check_globus_clients(self):
        try:
            self.web_service.set_transfer_client()
        except GlobusAPIError as e:
            http_status = e.http_status
            code = e.code
            details = e.message
            message = "transfer service unavailable: "
            message += " http_status = " + str(http_status)
            message += ", code = " + code
            message += ", message = " + details
            self.error_status[code] = message
            return

        transfer = self.web_service.transfer_client

        # confirm target and inbound endpoints
        target_endpoint = transfer.get_endpoint(self.web_service.mc_target_ep_id)
        inbound_endpoint = transfer.get_endpoint(self.globus_endpoint)

        if not target_endpoint or not inbound_endpoint:
            if not target_endpoint:
                message = "Materials Commons staging endpoint: " + self.web_service.mc_target_ep_id
                self.error_status["Missing target endpoint"] = message

            if not inbound_endpoint:
                message = "User's endpoint" + self.globus_endpoint
                self.error_status["Missing source endpoint"] = message

            return

        both = True
        try:
            transfer.operation_ls(self.web_service.mc_target_ep_id)
        except GlobusAPIError as e:
            both = False
            message = "Materials Commons staging endpoint, " + self.web_service.mc_target_ep_id
            message += ", code = " + e.code
            self.error_status["Cannot reach staging endpoint"] = message

        try:
            transfer.operation_ls(self.globus_endpoint)
        except GlobusAPIError as e:
            both = False
            message = "User's endpoint, " + self.globus_endpoint
            message += ", code = " + e.code
            self.error_status["Cannot reach user's endpoint"] = message

        if not both:
            return
        # what else needs to be checked?
        return

    def check_users_source_paths(self):
        if not self.find_user_path(self.data_dir_path):
            message = "User's endpoint directory not found, " + self.data_dir_path
            self.error_status["Missing data directory"] = message

        if not self.find_user_path(self.excel_file_path):
            message = "User's endpoint file not found, " + self.excel_file_path
            self.error_status["Missing Excel file"] = message

    def find_user_path(self, path):
        try:
            self.web_service.set_transfer_client()
            transfer = self.web_service.transfer_client
            entry = os.path.split(path)[-1]
            path = os.path.normpath(os.path.join(path, os.path.pardir))
            content = transfer.operation_ls(self.globus_endpoint, path=path)
            for element in content:
                if element['name'] == entry:
                    return True
            return False
        except GlobusAPIError:
            return False
