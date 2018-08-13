import logging
from ..utils.ConfClientHelper import ConfClientHelper
from ..database.DatabaseInterface import DatabaseInterface


class GlobusMonitor:

    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.helper = ConfClientHelper()
        self.database = DatabaseInterface()
        self.task_list = None

    def refresh(self):
        self.log.info("refresh task_list")
        self.task_list = self.helper.setup(full=True)

    def get_confidential_client_task_list(self):
        self.log.info("get_confidential_client_task_list")
        self.refresh()
        self.log.info("task_list length = {}".format(len(self.task_list)))
        return self.task_list

    def get_background_process_status_list(self, limit=20):
        self.log.info("get_background_process_status_list")
        status_list = self.database.get_status_records(limit=limit)
        for status_record in status_list:
            status_record["birthtime"] = self.convert_time(status_record["birthtime"])
            status_record["mtime"] = self.convert_time(status_record["mtime"])
        self.log.info("status_list length = {}".format(len(status_list)))
        return status_list

    def convert_time(self, time):
        self.log.info("time representation = {}".format(time))
        return time.isoformat()
