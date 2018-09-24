import os
import logging

from globus_sdk import ConfidentialAppAuthClient
from globus_sdk import TransferClient, TransferData
from globus_sdk import RefreshTokenAuthorizer

from ..utils.mcexceptions import DatabaseError, AuthenticationException, NoSuchItem, AccessNotAllowedException
from ..database.DB import DbConnection
from .GlobusAccess import GlobusAccess, CONFIDENTIAL_CLIENT_APP_AUTH
from ..database.DatabaseInterface import DatabaseInterface


class MaterialsCommonsGlobusInterface:
    def __init__(self, mc_user_id):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.debug("MaterialsCommonsGlobusInterface init - started")
        self.version = "0.1"
        self.mc_user_id = mc_user_id

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.mc_target_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        self.globus_access = GlobusAccess(use_implementation=CONFIDENTIAL_CLIENT_APP_AUTH)

        self.cc_transfer_client = None
        self.user_transfer_client = None
        self.source_user_globus_id = None

        if (not self.client_user) or (not self.client_token) or (not self.mc_target_ep_id):
            missing = []
            if not self.client_user:
                missing.append('MC_CONFIDENTIAL_CLIENT_USER')
            if not self.client_token:
                missing.append('MC_CONFIDENTIAL_CLIENT_PW')
            if not self.mc_target_ep_id:
                missing.append("MC_CONFIDENTIAL_CLIENT_ENDPOINT")
            message = "Missing environment values: {}".format(", ".join(missing))
            raise EnvironmentError(message)

        self.log.debug("MaterialsCommonsGlobusInterface init - done")

    def setup_transfer_clients(self):
        self.cc_transfer_client = self.globus_access.get_cc_transfer_client()
        self.user_transfer_client = self.get_user_transfer_client()

    def get_user_transfer_client(self):
        self.log.info("Getting MC User's globus infomation")
        records = DatabaseInterface().get_globus_auth_info_records_by_user_id(self.mc_user_id)
        # Only the latest
        record = (records[0] if len(records) > 0 else None)
        if not record:
            self.log.info("Globus auth info record for MC user {} does not exist; logged out?".format(self.mc_user_id))
            return None

        # else
        self.log.info("Got MC User's globus information; getting tokens")
        self.source_user_globus_id = record['globus_id']
        transfer_tokens = record['tokens']['transfer.api.globus.org']
        self.log.info("Got transfer.api.globus.org tokens; keys = {}".format(transfer_tokens.keys()))
        transfer_client = \
            self._get_transfer_client_from_tokens(transfer_tokens)
        if not transfer_client:
            self.log.error("User's Transfer Client is not available")
            return None
        return transfer_client

    def _get_transfer_client_from_tokens(self, transfer_tokens):
        authorizer = RefreshTokenAuthorizer(
            transfer_tokens['refresh_token'],
            self.globus_access.get_auth_client(),
            access_token=transfer_tokens['access_token'],
            expires_at=transfer_tokens['expires_at_seconds'])

        transfer = TransferClient(authorizer=authorizer)

        return transfer

    def set_user_access_rule(self, mc_target_endpoint_path):
        self.cc_transfer_client.endpoint_autoactivate(self.mc_target_ep_id)
        self.cc_transfer_client.add_endpoint_acl_rule(
            self.mc_target_ep_id,
            dict(principal=self.source_user_globus_id,
                 principal_type='identity', path=mc_target_endpoint_path, permissions='rw')
        )

    def get_user_access_rule(self, mc_target_endpoint_path):
        self.cc_transfer_client.endpoint_autoactivate(self.mc_target_ep_id)
        acl_list = self.cc_transfer_client.endpoint_acl_list(self.mc_target_ep_id)
        acl = None
        for probe in acl_list:
            if mc_target_endpoint_path == probe['path'] and self.source_user_globus_id == probe['principal']:
                acl = probe
        self.log.info("ACL from search: {}".format(acl))
        return acl

    def clear_user_access_rule(self, mc_target_endpoint_path):
        acl = self.get_user_access_rule(mc_target_endpoint_path)
        if acl:
            self.cc_transfer_client.delete_endpoint_acl_rule(self.target_endpoint, acl['id'])

    def transfer(self, source_endpoint, source_path, destination_endpoint, destination_path):
        self.log.info("Setting up transfer for:")
        self.log.info("  source_endpoint = {}".format(source_endpoint))
        self.log.info("  source_path = {}".format(source_path))
        self.log.info("  destination_endpoint = {}".format(destination_endpoint))
        self.log.info("  destination_path = {}".format(destination_path))
        transfer_data = TransferData(transfer_client=self.user_transfer_client,
                                     source_endpoint=source_endpoint,
                                     destination_endpoint=destination_endpoint,
                                     label='Test-transfer-basic-root')
        self.log.info("Object transfer_data = {}".format(transfer_data))
        transfer_data.add_item(source_path=source_path,
                               destination_path=destination_path,
                               recursive=True)
        self.log.info("Object transfer_data = {}".format(transfer_data))

        self.log.info("Before submit transfer")
        results = self.user_transfer_client.submit_transfer(transfer_data)
        self.log.info("After submit transfer: {}".format(results))
        task_id = results['task_id']
        return task_id


    # def upload_files(self, project_id, inbound_endpoint_id, inbound_endpoint_path):
    #     self.log.info("upload_files: " + inbound_endpoint_id + ", " + inbound_endpoint_path)
    #     conn = DbConnection().connection()
    #     r = DbConnection().interface()
    #     proj = r.table('projects').get(project_id).run(conn)
    #     if not proj:
    #         error = "Unable to find project, " + project_id
    #         self.log.error("Error: " + str(error))
    #         raise NoSuchItem(error)
    #
    #     if not proj['owner'] == self.mc_user_id:
    #         error = "Current user is not project owner, " + self.mc_user_id + ", " + project_id
    #         self.log.error("Error: " + str(error))
    #         raise AccessNotAllowedException(error)
    #
    #     try:
    #         self.cc_transfer_client.endpoint_autoactivate(self.mc_target_ep_id)
    #         self.cc_transfer_client.add_endpoint_acl_rule(
    #             self.mc_target_ep_id,
    #             dict(principal=self.source_user_globus_id,
    #                  principal_type='identity', path="/upload/", permissions='rw')
    #         )
    #     except TransferAPIError as error:
    #         # PermissionDenied can happen if a new Portal client is swapped
    #         # in and it doesn't have endpoint manager on the dest_ep.
    #         # The /portal/processed directory has been set to to read/write
    #         # for all users so the subsequent operations will succeed.
    #         self.log.info(error)
    #         if error.code == 'PermissionDenied':
    #             pass
    #         elif error.code != 'Exists':
    #             pass
    #
    #     self.log.info("ACL was set")
    #     transfer_label = "Transfer from " + " hello world " + "Materials Commons"
    #     self.log.info("transfer_label =" + transfer_label)
    #     transfer_data = TransferData(transfer_client=self.user_transfer_client,
    #                                  source_endpoint=inbound_endpoint_id,
    #                                  destination_endpoint=self.mc_target_ep_id,
    #                                  label=transfer_label)
    #     self.log.info("inbound_endpoint_path" + inbound_endpoint_path)
    #     transfer_data.add_item(source_path=inbound_endpoint_path,
    #                            destination_path="/upload/", recursive=True)
    #     transfer_response = self.user_transfer_client.submit_transfer(transfer_data)
    #     return transfer_response

    # def stage_upload_files(self, project_id, transfer_id, inbound_endpoint_id, inbound_endpoint_path):
    #     if not self.transfer_client:
    #         error = "Missing authenticated transfer client"
    #         self.log.error("Error: " + str(error))
    #         raise AuthenticationException(error)
    #
    #     conn = DbConnection().connection()
    #     r = DbConnection().interface()
    #     proj = r.table('projects').get(project_id).run(conn)
    #     if not proj:
    #         error = "Unable to find project, " + project_id
    #         self.log.error("Error: " + str(error))
    #         raise NoSuchItem(error)
    #
    #     if not proj['owner'] == self.mc_user_id:
    #         error = "Current user is not project owner, " + self.mc_user_id + ", " + project_id
    #         self.log.error("Error: " + str(error))
    #         raise AccessNotAllowedException(error)
    #
    #     transfer = self.transfer_client
    #     self.log.debug("Starting upload staging... function: stage_upload_files(inbound_endpoint_id)")
    #     self.log.debug("Materials Commons user = " + self.mc_user_id)
    #     self.log.info("Globus transfer endpoint uuid = " + inbound_endpoint_id)
    #
    #     # confirm target and inbound endpoints
    #     target_endpoint = transfer.get_endpoint(self.mc_target_ep_id)
    #     inbound_endpoint = transfer.get_endpoint(inbound_endpoint_id)
    #
    #     if not target_endpoint:
    #         error = "Missing target endpoint, Materials Commons staging"
    #         self.log.error("Error: " + str(error))
    #         raise NoSuchItem(error)
    #
    #     if not inbound_endpoint:
    #         error = "Missing inbound endpoint, user's input for staging"
    #         self.log.error("Error: " + str(error))
    #         raise NoSuchItem(error)
    #
    #     target_endpoint_id = target_endpoint['id']
    #
    #     self.log.debug("About to confirm inbound path: " + inbound_endpoint_path)
    #     # confirm inbound path
    #     try:
    #         transfer.operation_ls(inbound_endpoint_id, path=inbound_endpoint_path)
    #     except TransferAPIError as error:
    #         self.log.error("Error: " + str(error))
    #         raise error
    #
    #     self.log.debug("Finished confirm of inbound path: " + inbound_endpoint_path)
    #     # database entries and one-time-directory on target
    #     dir_name = "transfer-" + transfer_id
    #     response = transfer.operation_mkdir(target_endpoint_id, dir_name)
    #     if not response["code"] == "DirectoryCreated":
    #         error = "Unable to create directory on target endpoint " + dir_name
    #         self.log.error("Error: " + str(error))
    #         raise TransferAPIError(error)
    #
    #     self.log.info("Found for target endpoint: " + target_endpoint['display_name'])
    #     self.log.debug("    - target endpoint id " + target_endpoint_id)
    #     self.log.debug("Found inbound endpoint: " +
    #                    inbound_endpoint['display_name'] +
    #                    " from " + inbound_endpoint["owner_string"])
    #     self.log.info("Initiating transfer to target directory: " + dir_name)
    #
    #     # initiate transfer
    #     transfer_label = "Transfer from " + inbound_endpoint['display_name'] + \
    #                      "Materials Commons"
    #     transfer_data = TransferData(
    #         transfer, inbound_endpoint_id, target_endpoint_id, label=transfer_label, sync_level="checksum")
    #     transfer_data.add_item(inbound_endpoint_path, "/" + dir_name, recursive=True)
    #     transfer_result = transfer.submit_transfer(transfer_data)
    #     self.log.debug("Finished upload staging: successfully completed")
    #     return_result = {}
    #     keys = ["code", "message", "task_id", "submission_id"]
    #     for key in keys:
    #         return_result[key] = transfer_result[key]
    #
    #     return return_result

    def get_task_status(self, task_id):
        if not self.user_transfer_client:
            error = "Missing authenticated transfer client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)

        transfer = self.user_transfer_client

        error = None
        for event in transfer.task_event_list(task_id):
            if event["is_error"]:
                error = event

        if error:
            self.log.error("Globus transfer error: " + error['description'] + " - " + self.mc_user_id)
            self.log.error("   -- code " + error['code'])
            self.log.error("   -- message " + error['details'])
            error = {"error": error['code'], "message": error['details']}
        transfer_result = transfer.get_task(task_id)

        return_result = {}
        if error:
            return_result = error
        keys = ["status", "nice_status_details", "files", "files_skipped"]
        for key in keys:
            return_result[key] = transfer_result[key]
        return return_result

    def get_auth_client(self):
        auth_client = ConfidentialAppAuthClient(
            client_id=self.client_user, client_secret=self.client_token)
        return auth_client

    @staticmethod
    def insert_entry_id(table_name, entry):
        conn = DbConnection().connection()
        r = DbConnection().interface()
        rr = r.table(table_name).insert(entry, return_changes=True)
        rv = rr.run(conn)
        if rv['inserted'] == 1:
            if 'generated_keys' in rv:
                return rv['generated_keys'][0]
            else:
                return rv['new_val']['id']
        raise DatabaseError()
