import sys
import logging
from backend.etlserver.faktory.TaskChain import TaskChain
import time

def main():
    log = logging.getLogger("top_level_run_worker")
    task_chain = TaskChain()
    n = 10
    for x in range(0,n):
        log.debug("Simulating the starting of {} upload tasks: {}".format(n, x))
        task_chain.start_chain()
        time.sleep(5)


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    main()
