import logging
from ..faktory.EtlFaktoryWorker import EtlFaktoryWorker as Worker
from ..utils.LoggingHelper import LoggingHelper


def main():
    log = logging.getLogger("top_level_run_worker")
    worker = Worker()
    # Note: runs "forever"
    log.info("Run ETL worker")
    worker.run()


if __name__ == "__main__":
    LoggingHelper().set_root()

    main()
