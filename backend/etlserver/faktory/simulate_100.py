import sys
import logging
from backend.etlserver.faktory.TaskChain import TaskChain


def main():
    log = logging.getLogger("top_level_run_worker")
    task_chain = TaskChain()
    for x in range(0,100):
        log.debug("Simulating the starting of 100 upload tasks: " + str(x))
        task_chain.start_chain()


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    main()
