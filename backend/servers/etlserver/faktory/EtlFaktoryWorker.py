import logging
import json
from time import sleep
from faktory import Worker
from .TaskChain import TaskChain, GLOBUS_QUEUE, PROCESS_QUEUE


class EtlFaktoryWorker:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.tasks = TaskChain()
        self.possible_errors = (
            json.decoder.JSONDecodeError,
            ConnectionRefusedError,
            ConnectionResetError,
            BrokenPipeError)

    def setup(self, worker):
        self.tasks.setup_in_worker(worker)

    def new_worker(self):
        worker = Worker(faktory="tcp://localhost:7419", queues=[GLOBUS_QUEUE, PROCESS_QUEUE], concurrency=1)
        self.setup(worker)
        return worker

    def run(self):
        retry_count = 0
        while retry_count < 21:
            try:
                if retry_count:
                    self.log.info("Retrying start of worker; count = {}".format(retry_count))
                self.new_worker().run()
            except self.possible_errors as error:
                time_to_sleep = 5 + retry_count * 2
                self.log.error(error)
                self.log.error("It appears that Faktory may not be running " + \
                               "- sleeping {} seconds, then retry". format(time_to_sleep))
                sleep(time_to_sleep)
                retry_count += 1
        self.log.error("Failed to start ETL worker task after {} retrys".format(retry_count - 1))