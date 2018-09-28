import os
import logging
import time
from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
from ..common.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface


class GlobusMCTransfer:
    def __init__(self, mc_user_id):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.mc_user_id = mc_user_id
        self.mc_globus_interface = None
        self.destination_path = None
        self.log.info("init - done")

    def transfer_and_await(self, status_record_id):
        self.log.info("Starting transfer_and_await")
        self.mc_globus_interface = MaterialsCommonsGlobusInterface(self.mc_user_id)
        self.mc_globus_interface.setup_transfer_clients()
        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)
        source_endpoint = status_record['extras']['globus_endpoint']
        source_path = status_record['extras']['globus_path']
        destination_endpoint = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')
        destination_path = status_record['extras']['globus_destination_path']
        self.destination_path = destination_path
        user_label = status_record['extras']['label']

        task_id = self.mc_globus_interface.transfer(
            source_endpoint=source_endpoint, source_path=source_path,
            destination_endpoint=destination_endpoint, destination_path=destination_path,
            label=user_label
        )

        self.log.info("Starting await loop")
        status = "STARTED"
        while not status == "SUCCEEDED" and not status == "FAILED":
            task = self.mc_globus_interface.user_transfer_client.get_task(task_id)
            status = task['status']
            self.log.info("Current task status = {}".format(status))
            time.sleep(5)
        self.mc_globus_interface.clear_user_access_rule(destination_path)
        results = {'status': status}
        return results

    def cleanup_on_error(self):
        self.mc_globus_interface.clear_user_access_rule(self.destination_path)
