import logging
from ..utils.LoggingHelper import LoggingHelper
from ..database.DatabaseInterface import DatabaseInterface


class FaktoryStatus:
    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info("Starting FaktoryMonitor")
        self.status_records = []

    def fetch_mc_process_records(self):
        self.log.info("In mc_process_records()")
        self.status_records = DatabaseInterface().get_status_records(limit=10)
        self.log.info("fetched {} status record(s)".format(len(self.status_records)))
        return self.status_records

    def log_mc_process_records(self):
        for record in self.status_records:
            self.log.info(self.format_record(record))

    @staticmethod
    def format_record(record):
        description = record['description']
        globus_endpoint = record['extras']['globus_endpoint']
        # transfer_path = record['extras']['transfer_base_path']
        # owner = record['owner']
        # project_id = record['project_id']
        queue = record['queue']
        status = record['status']
        return "{}: ep = {}, queue = {}, status = {}".\
            format(description, globus_endpoint, queue, status)


def main():
    log = logging.getLogger("Main")
    log.info("In Main")
    fs = FaktoryStatus()
    fs.fetch_mc_process_records()
    fs.log_mc_process_records()


if __name__ == "__main__":
    LoggingHelper().set_root()

    setup_log = logging.getLogger("Main_setup")
    setup_log.info("In Main_setup")

    main()
