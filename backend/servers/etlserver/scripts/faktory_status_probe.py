import logging
from ..utils.LoggingHelper import LoggingHelper


class FaktoryStatus:
    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info("Starting FaktoryMonitor")

    def mc_process_records(self):
        self.log.info("In mc_process_records()")


def main():
    log = logging.getLogger("Main")
    log.info("In Main")
    process_records = FaktoryStatus().mc_process_records()


if __name__ == "__main__":
    LoggingHelper().set_root()

    setup_log = logging.getLogger("Main_setup")
    setup_log.info("In Main_setup")

    main()
