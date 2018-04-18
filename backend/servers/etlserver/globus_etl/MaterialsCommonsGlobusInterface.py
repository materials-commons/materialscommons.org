import os
import logging

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import TransferClient, TransferData, TransferAPIError

from ..mcexceptions import DatabaseError, AuthenticationException, NoSuchItem, AccessNotAllowedException
from ..DB import DbConnection


class MaterialsCommonsGlobusInterface:
    def __init__(self, mc_user_id):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.debug("MaterialsCommonsGlobusInterface init - started")
        self.version = "0.1"
        self.mc_user_id = mc_user_id

        self.client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        self.client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
        self.mc_target_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')

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

        self.transfer_client = None
        self.log.debug("MaterialsCommonsGlobusInterface init - done")

    def set_transfer_client(self):
        self.log.debug("MaterialsCommonsGlobusInterface set_transfer_client - started")
        auth_client = self.get_auth_client()
        if not auth_client:
            error = "No Authentication Client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)
        self.log.debug("MaterialsCommonsGlobusInterface set_transfer_client - auth_client")
        self.log.debug(auth_client)
        transfer = self.get_transfer_interface(auth_client)
        if not transfer:
            error = "No transfer interface"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)
        self.transfer_client = transfer
        self.log.debug("MaterialsCommonsGlobusInterface set_transfer_client - done")
        return {"status": "ok"}

    def stage_upload_files(self, project_id, transfer_id, inbound_endpoint_id, inbound_endpoint_path):
        if not self.transfer_client:
            error = "Missing authenticated transfer client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)

        conn = DbConnection().connection()
        r = DbConnection().interface()
        proj = r.table('projects').get(project_id).run(conn)
        if not proj:
            error = "Unable to find project, " + project_id
            self.log.error("Error: " + str(error))
            raise NoSuchItem(error)

        if not proj['owner'] == self.mc_user_id:
            error = "Current user is not project owner, " + self.mc_user_id + ", " + project_id
            self.log.error("Error: " + str(error))
            raise AccessNotAllowedException(error)

        transfer = self.transfer_client
        self.log.debug("Starting upload staging... function: stage_upload_files(inbound_endpoint_id)")
        self.log.debug("Materials Commons user = " + self.mc_user_id)
        self.log.info("Globus transfer endpoint uuid = " + inbound_endpoint_id)

        # confirm target and inbound endpoints
        target_endpoint = transfer.get_endpoint(self.mc_target_ep_id)
        inbound_endpoint = transfer.get_endpoint(inbound_endpoint_id)

        if not target_endpoint:
            error = "Missing target endpoint, Materials Commons staging"
            self.log.error("Error: " + str(error))
            raise NoSuchItem(error)

        if not inbound_endpoint:
            error = "Missing inbound endpoint, user's input for staging"
            self.log.error("Error: " + str(error))
            raise NoSuchItem(error)

        target_endpoint_id = target_endpoint['id']

        self.log.debug("About to confirm inbound path: " + inbound_endpoint_path)
        # confirm inbound path
        try:
            transfer.operation_ls(inbound_endpoint_id, path=inbound_endpoint_path)
        except TransferAPIError as error:
            self.log.error("Error: " + str(error))
            raise error

        self.log.debug("Finished confirm of inbound path: " + inbound_endpoint_path)
        # database entries and one-time-directory on target
        dir_name = "transfer-" + transfer_id
        response = transfer.operation_mkdir(target_endpoint_id, dir_name)
        if not response["code"] == "DirectoryCreated":
            error = "Unable to create directory on target endpoint " + dir_name
            self.log.error("Error: " + str(error))
            raise TransferAPIError(error)

        self.log.info("Found for target endpoint: " + target_endpoint['display_name'])
        self.log.info("    - target endpoint id " + target_endpoint_id)
        self.log.info("Found inbound endpoint: " +
                      inbound_endpoint['display_name'] +
                      " from " + inbound_endpoint["owner_string"])
        self.log.info("Initiating transfer to target directory: " + dir_name)

        # initiate transfer
        transfer_label = "Transfer from " + inbound_endpoint['display_name'] + \
                         "Materials Commons"
        transfer_data = TransferData(
            transfer, inbound_endpoint_id, target_endpoint_id, label=transfer_label, sync_level="checksum")
        transfer_data.add_item(inbound_endpoint_path, "/" + dir_name, recursive=True)
        transfer_result = transfer.submit_transfer(transfer_data)
        self.log.debug("Finished upload staging: successfully completed")
        return_result = {}
        keys = ["code", "message", "task_id", "submission_id"]
        for key in keys:
            return_result[key] = transfer_result[key]

        return return_result

    def get_task_status(self, task_id):
        if not self.transfer_client:
            error = "Missing authenticated transfer client"
            self.log.error("Error: " + str(error))
            raise AuthenticationException(error)

        transfer = self.transfer_client

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

    def get_transfer_interface(self, auth_client):
        self.log.debug("get_transfer_interface")
        if self.transfer_client:
            self.log.debug("found transfer_client")
            return self.transfer_client

        self.log.debug("did not found transfer_client")
        self.log.debug("auth_client")
        self.log.debug(auth_client)

        scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
        cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
        transfer_client = TransferClient(authorizer=cc_authorizer)
        self.log.debug("get_transfer_interface - transfer_client")
        self.log.debug(transfer_client)
        return transfer_client

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
