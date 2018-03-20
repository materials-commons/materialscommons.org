import os.path as os_path
import logging
import configparser

import rethinkdb as r

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import TransferClient, TransferData, TransferAPIError

from flask import g

import dmutil


# model for mcglobusapi task record
class Globus(object):
    def __init__(self, name, owner, project_id, project_path, task_id=None, transfer_dir=None, description=''):
        self.name = name
        self.description = description
        self.owner = owner
        self.project_id = project_id
        self.project_path = project_path
        self.task_id = task_id
        self.transfer_dir = transfer_dir
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.otype = "globus"


class MaterialsCommonsGlobusInterface:
    def __init__(self, mc_user_id):
        self.log("MaterialsCommonsGlobusInterface init - started")
        self.version = "0.1"
        self.mc_user_id = mc_user_id
        home = os_path.expanduser("~")
        self.config_path = os_path.join(home, '.mcglobusapi', 'mc_client_config.ini')

        config = configparser.ConfigParser()
        config.read(str(self.config_path))

        self.client_user = config['mc_client']['user']
        self.client_token = config['mc_client']['token']
        self.mc_target_ep_id = config['mc_client']['ep_id']

        self.transfer_client = None
        self.log("MaterialsCommonsGlobusInterface init - done")

    def set_transfer_client(self):
        self.log("MaterialsCommonsGlobusInterface set_transfer_client - started")
        auth_client = self.get_auth_client()
        if not auth_client:
            error = "No Authentication Client"
            self.log("Error: " + error)
            return {"status": "error", "error": error}
        self.log("MaterialsCommonsGlobusInterface set_transfer_client - auth_client")
        self.log(auth_client)
        transfer = self.get_transfer_interface(auth_client)
        if not transfer:
            error = "No transfer interface"
            self.log("Error: " + error)
            return {"status": "error", "error": error}
        self.transfer_client = transfer
        self.log("MaterialsCommonsGlobusInterface set_transfer_client - done")
        return {"status": "ok"}

    def stage_upload_files(self, project_id, inbound_endpoint_id, project_path, inbound_endpoint_path):
        if not self.transfer_client:
            error = "Missing authenticated transfer client"
            self.log("Error: " + error)
            return {"error": error}

        proj = r.table('projects').get(project_id).run(g.conn)
        if not proj:
            error = "Unable to find project, " + project_id
            self.log("Error: " + error)
            return {"error": error}

        if not proj['owner'] == self.mc_user_id:
            error = "Current user is not project owner, " + self.mc_user_id + ", " + project_id
            self.log("Error: " + error)
            return {"error": error}

        transfer = self.transfer_client
        self.log("Starting upload staging... function: stage_upload_files(inbound_endpoint_id)")
        self.log("Materials Commons user = " + self.mc_user_id)
        self.log("Globus transfer endpoint uuid = " + inbound_endpoint_id)

        # confirm target and inbound endpoints
        target_endpoint = transfer.get_endpoint(self.mc_target_ep_id)
        inbound_endpoint = transfer.get_endpoint(inbound_endpoint_id)

        if not target_endpoint:
            error = "Missing target endpoint, Materials Commons staging"
            self.log("Error: " + error)
            return {"error": error}

        if not inbound_endpoint:
            error = "Missing inbound endpoint, user's input for staging"
            self.log("Error: " + error)
            return {"error": error}

        target_endpoint_id = target_endpoint['id']

        # confirm inbound path
        try:
            transfer.operation_ls(inbound_endpoint, path=inbound_endpoint_path)
        except TransferAPIError as error:
            self.log("Error: " + str(error))
            return {"error": str(error)}

        # database entries and one-time-directory on target
        name = "transfer-" + self.mc_user_id + ":" + project_id
        globus_record = Globus(name, self.mc_user_id, project_id, project_path)
        globus_record_id = dmutil.insert_entry_id('mcglobusapi', globus_record.__dict__)
        if not globus_record_id:
            error = "Failed to create mcglobusapi (transfer) table entry"
            self.log("Error: " + error)
            return {"error": error}
        dir_name = "transfer-" + globus_record_id
        response = transfer.operation_mkdir(target_endpoint_id, dir_name)
        if not response["code"] == "DirectoryCreated":
            error = "Unable to create directory on target endpoint " + dir_name
            self.log("Error: " + error)
            return {"error": error}

        self.log("Found for target endpoint: " + target_endpoint['display_name'])
        self.log("    - target endpoint id " + target_endpoint_id)
        self.log("Found inbound endpoint: " + inbound_endpoint['display_name']
                 + " from " + inbound_endpoint["owner_string"])
        self.log("Initiating transfer to target directory: " + dir_name)
        self.log("Recorded as entry in mcglobusapi table: " + globus_record_id)

        # initiate transfer
        transfer_label = "Transfer from " + inbound_endpoint['display_name'] + \
                         "Materials Commons"
        transfer_data = TransferData(
            transfer, inbound_endpoint_id, target_endpoint_id, label=transfer_label, sync_level="checksum")
        transfer_data.add_item(inbound_endpoint_path, "/" + dir_name, recursive=True)
        transfer_result = transfer.submit_transfer(transfer_data)
        self.log("Finished upload staging: successfully completed")
        return_result = {}
        keys = ["code", "message", "task_id", "submission_id"]
        for key in keys:
            return_result[key] = transfer_result[key]

        # update record in database: task_id and dir_name
        update_values = {"task_id": return_result["task_id"], "transfer_dir": dir_name}
        r.table('mcglobusapi').get(globus_record_id).update(update_values).run(g.conn)

        return return_result

    def get_task_status(self, task_id):
        if not self.transfer_client:
            error = "Missing authenticated transfer client"
            self.log("Error: " + error)
            return {"error": error}

        transfer = self.transfer_client

        error = None
        for event in transfer.task_event_list(task_id):
            if event["is_error"]:
                error = event

        if error:
            self.log("Globus transfer error: " + error['description'] + " - " + self.mc_user_id)
            self.log("   -- code " + error['code'])
            self.log("   -- message " + error['details'])
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
        self.log("get_transfer_interface")
        if self.transfer_client:
            self.log("found transfer_client")
            return self.transfer_client

        self.log("did not found transfer_client")
        self.log("auth_client")
        self.log(auth_client)

        scopes = "urn:mcglobusapi:auth:scope:transfer.api.mcglobusapi.org:all"

        logging.basicConfig(level=logging.DEBUG)
        root = logging.getLogger()
        root.setLevel(logging.DEBUG)

        cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
        self.log("cc_authorizer")
        self.log(cc_authorizer)
        transfer_client = TransferClient(authorizer=cc_authorizer)
        self.log("return transfer_client")
        return transfer_client

    @staticmethod
    def log(message):
        dmutil.msg(message)
