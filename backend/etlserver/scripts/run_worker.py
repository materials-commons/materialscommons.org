import sys
import logging
from ..faktory.EtlFaktoryWorker import EtlFaktoryWorker as Worker


def main():
    log = logging.getLogger("top_level_run_worker")
    worker = Worker()
    log.debug("Setup ETL worker")
    worker.setup()
    # Note: runs "forever"
    log.info("Run ETL worker")
    worker.run()


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.ERROR)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    main()
