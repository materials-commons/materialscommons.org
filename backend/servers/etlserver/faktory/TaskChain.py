import logging
import faktory
from ..globus_etl_upload.etl_task_library import elt_globus_upload, etl_excel_processing
from ..globus_non_etl_upload.non_etl_task_library import non_etl_globus_upload, non_etl_file_processing

ETL_GLOBUS_UPLOAD_NAME = "ETL Globus Upload"
ETL_EXCEL_PROCESS_NAME = "ETL Excel Process"
NON_ETL_GLOBUS_FILE_UPLOAD_NAME = "Non-ETL Globus File Upload"
NON_ETL_TRANSFORM_PROCESS_NAME = "Non-ETL Globus File Transform"
GLOBUS_QUEUE = 'etl-globus-transfer'
EXCEL_PROCESS_QUEUE = 'etl-build-experiment'
FILE_UPLOAD_QUEUE = 'non-etl-globus-file-upload'
FILE_PROCESS_QUEUE = 'non-etl-file-transformation'


class TaskChain:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("Setting up TaskChain")

    def setup_in_worker(self, worker):
        self.log.info("Setting up task for ETL/Globus upload")
        task1 = elt_globus_upload
        worker.register(ETL_GLOBUS_UPLOAD_NAME, task1)
        self.log.info("Setting up task for ETL/Excel processing")
        task2 = etl_excel_processing
        worker.register(ETL_EXCEL_PROCESS_NAME, task2)
        self.log.info("Setting up task for Non-ETL/Globus file upload")
        task3 = non_etl_globus_upload
        worker.register(NON_ETL_GLOBUS_FILE_UPLOAD_NAME, task3)
        self.log.info("Setting up task for Non-ETL/Globus file upload")
        task4 = non_etl_file_processing
        worker.register(NON_ETL_TRANSFORM_PROCESS_NAME, task4)

    def start_elt_chain(self, status_record_id):
        self.queue_globus_upload(status_record_id)

    def queue_globus_upload(self, status_record_id):
        self.log.debug("Queueing ELT/Globus upload Task " + str(status_record_id))
        with faktory.connection() as client:
            client.queue(ETL_GLOBUS_UPLOAD_NAME, args=[status_record_id], queue=GLOBUS_QUEUE)

    def queue_excel_processing(self, status_record_id):
        self.log.debug("Queueing Excel processing Task " + str(status_record_id))
        with faktory.connection() as client:
            client.queue(ETL_EXCEL_PROCESS_NAME, args=[status_record_id], queue=EXCEL_PROCESS_QUEUE)

    def start_non_etl_chain(self, status_record_id):
        self.queue_non_etl_globus_file_upload(status_record_id)

    def queue_non_etl_globus_file_upload(self, status_record_id):
        self.log.info("Queueing Non-ETL Globus File Upload Task " + str(status_record_id))
        with faktory.connection() as client:
            client.queue(NON_ETL_GLOBUS_FILE_UPLOAD_NAME, args=[status_record_id], queue=FILE_UPLOAD_QUEUE)

    def queue_non_etl_file_transformation(self, status_record_id):
        self.log.info("Queueing Non-ETL File Transformation Task " + str(status_record_id))
        with faktory.connection() as client:
            client.queue(NON_ETL_TRANSFORM_PROCESS_NAME, args=[status_record_id], queue=FILE_PROCESS_QUEUE)
