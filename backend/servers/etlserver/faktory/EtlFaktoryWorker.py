import logging
import json
from time import sleep
from faktory import Worker
from .TaskChain import TaskChain, GLOBUS_QUEUE, PROCESS_QUEUE


class EtlFaktoryWorker:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.worker = Worker(faktory="tcp://localhost:7419", queues=[GLOBUS_QUEUE, PROCESS_QUEUE], concurrency=1)
        self.tasks = TaskChain()

    def setup(self):
        self.tasks.setup_in_worker(self.worker)

    def run(self):
        retry_count = 0
        while retry_count < 21:
            try:
                if retry_count:
                    self.log.info("Retrying start of worker; count = {}".format(retry_count))
                self.worker.run()
            except (json.decoder.JSONDecodeError, ConnectionRefusedError) as error:
                # time_to_sleep = 5 + retry_count * 2
                time_to_sleep = 5
                self.log.error(error)
                self.log.error("It appears that Faktory may not be running " + \
                               "- sleeping {} seconds, then retry". format(time_to_sleep))
                sleep(time_to_sleep)
                retry_count += 1
        self.log.error("Failed to start ETL worker task after {} retrys".format(retry_count - 1))