import logging
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
        self.worker.run()