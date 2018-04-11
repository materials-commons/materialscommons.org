from os import environ
from datetime import datetime, timedelta
import json
import pprint
import sys
import time
import faktory
import logging

faktory_port_probe = environ.get('FAKTORY_PORT')
if not faktory_port_probe:
    print("Unable to run without a setting for FAKTORY_PORT")
    exit(-1)
_FAKTORY_PORT = int(environ.get('FAKTORY_PORT'))

pp = pprint.PrettyPrinter(indent=4)

class FaktoryProbe:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.conn = None

    @staticmethod
    def probe_function(x, y):
        time.sleep(3)
        return x + y

    def queue_tasks(self):
        with faktory.connection() as client:
            for x in range(1, 5):
                client.queue('test', args=(1, x), queue='default')
                self.log.info("queued job test with args = (1, " + str(x) + ")")
                time.sleep(1)

    def run_worker(self):
        self.log.info("Starting working")
        faktory_url = "tcp://localhost:" + str(_FAKTORY_PORT)
        w = faktory.Worker(faktory=faktory_url, queues=['default'], concurrency=2)
        w.faktory.debug = True
        w.register('test', self.probe_function)
        self.log.info("Worker id = " + w.get_worker_id())
        self.modified_run(w)

    def modified_run(self, worker):
        """
        Start the worker
        `run()` will trap signals, on the first ctrl-c it will try to gracefully shut the worker down, waiting up to 15
        seconds for in progress tasks to complete.
        If after 30 seconds tasks are still running, they are forced to terminate and the worker will close.
        This method is blocking -- it will only return when the worker has shutdown, either by control-c or by
        terminating it from the Faktory Web UI.
        :return:
        :rtype:
        """
        # create a pool of workers
        if not worker.faktory.is_connected:
            worker.faktory.connect(worker_id=worker.worker_id)

        self.log.debug("Creating a worker pool with concurrency of {}".format(worker.concurrency))

        worker._last_heartbeat = datetime.now() + timedelta(
            seconds=worker.send_heartbeat_every)  # schedule a heartbeat for the future

        self.log.info("Queues: {}".format(", ".join(worker.get_queues())))
        self.log.info("Labels: {}".format(", ".join(worker.faktory.labels)))

        outstanding = self.total_enqueued(worker)
        while outstanding > 0:
            # tick runs continuously to process events from the faktory connection
            self.log.info("Tick cycle: " + str(outstanding))
            worker.tick()
            if not worker.faktory.is_connected:
                break
            outstanding = self.total_enqueued(worker)

        time.sleep(10)
        worker.log.info("Shutdown: waiting up to 15 seconds for workers to finish current tasks")
        worker.disconnect(wait=15)

        if worker.faktory.is_connected:
            worker.log.warning("Forcing worker processes to shutdown...")
            worker.disconnect(force=True)

        worker.executor.shutdown(wait=False)

    def total_enqueued(self, worker):
        worker.faktory.reply("INFO")
        blob = next(worker.faktory.get_message())
        data = json.loads(blob)
        fk = data['faktory']
        fkt1 = fk['total_enqueued']
        fkt2 = fk['tasks']['Busy']['size']
        fkt3 = fk['tasks']['Dead']['size']
        fkt4 = fk['tasks']['Retries']['size']
        fkt5 = fk['tasks']['Workers']['size']
        print(fkt1, fkt2, fkt3, fkt4, fkt5)
        return int(data['faktory']['total_enqueued'])


def main():
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    probe = FaktoryProbe()
    probe.queue_tasks()
    probe.run_worker()


if __name__ == "__main__":
    main()