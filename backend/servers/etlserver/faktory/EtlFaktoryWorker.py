import json
import logging
from time import sleep

from faktory import Worker

from .TaskChain import TaskChain, GLOBUS_QUEUE, EXCEL_PROCESS_QUEUE, FILE_UPLOAD_QUEUE, FILE_PROCESS_QUEUE


class EtlFaktoryWorker:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("Starting EtlFaktoryWorker")
        self.tasks = TaskChain()
        self.possible_errors = (
            json.decoder.JSONDecodeError,
            ConnectionRefusedError,
            ConnectionResetError,
            BrokenPipeError)

    def setup(self, worker):
        self.tasks.setup_in_worker(worker)

    def new_worker(self):
        worker_log = logging.getLogger("worker")
        self.log.info("Starting worker")
        worker = Worker(faktory="tcp://localhost:7419",
                        queues=[GLOBUS_QUEUE, EXCEL_PROCESS_QUEUE, FILE_UPLOAD_QUEUE, FILE_PROCESS_QUEUE],
                        concurrency=1,
                        log=worker_log)
        self.setup(worker)
        return worker

    def run(self):
        retry_count = 0
        while retry_count < 21:
            try:
                if retry_count:
                    self.log.info("Retrying start of worker; count = {}".format(retry_count))
                print("====")
                print("== Starting ETLFaktoryWorker: log level = {}".format(self._get_printable_log_level()))
                print("====")
                self.new_worker().run()
            except self.possible_errors as error:
                time_to_sleep = 5 + retry_count * 2
                self.log.error(error)
                self.log.error("It appears that Faktory may not be running " +
                               "- sleeping {} seconds, then retry".format(time_to_sleep))
                sleep(time_to_sleep)
                retry_count += 1
        self.log.error("Failed to start ETL worker task after {} retrys".format(retry_count - 1))

    def _get_printable_log_level(self):
        level = self.log.getEffectiveLevel()
        level_list = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if level < 10:
            return "level not set"
        index = (level // 10) - 1
        if index > 4:
            index == 4
        return level_list[index]