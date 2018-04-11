import logging
import time
import random
import faktory
from .task_library import elt_globus_upload, etl_excel_processing

ETL_GLOBUS_UPLOAD_NAME = "ETL Globus Upload"
ETL_EXCEL_PROCESS_NAME = "ETL Excel Process"


class TaskChain:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.count = 100

    def setup_in_worker(self, worker):
        self.log.debug("Setting up task for ETL/Globus upload")
        task1 = elt_globus_upload
        worker.register(ETL_GLOBUS_UPLOAD_NAME, task1)
        self.log.debug("Setting up task for ETL/Excel processing")
        task2 = etl_excel_processing
        worker.register(ETL_EXCEL_PROCESS_NAME, task2)

    def start_chain(self):
        task_status_id = self._setup_chain()
        self.queue_globus_upload(task_status_id)

    def queue_globus_upload(self, task_status_id):
        self.log.debug("Queueing ELT/Globus upload Task " + str(task_status_id))
        with faktory.connection() as client:
            client.queue(ETL_GLOBUS_UPLOAD_NAME, args=[task_status_id], queue='default')

    def queue_excel_processing(self, task_status_id):
        self.log.debug("Queueing Excel processing Task " + str(task_status_id))
        with faktory.connection() as client:
            client.queue(ETL_EXCEL_PROCESS_NAME, args=[task_status_id], queue='default')

    def _setup_chain(self):
        task_status_id = str(self.count)
        self.count += 1
        self.log.debug("Simulated chain setup: " + str(task_status_id))
        return task_status_id
