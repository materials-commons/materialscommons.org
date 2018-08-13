import os
import sys
import logging


class LoggingHelper:
    def __init__(self):
        self.logging_level_table = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARNING": logging.WARNING,
            "ERROR": logging.ERROR,
            "CRITICAL": logging.CRITICAL
        }
        self.root = None
        self.log = None
        self.logging_level = logging.INFO

    def set_root(self, default=None):
        self.root = logging.getLogger()
        self.logging_level = default or self.logging_level
        env_logging_level = os.environ.get('MC_ETL_WORKER_LOG_LEVEL')
        if env_logging_level:
            probe = self.get_logging_level(env_logging_level)
            if probe:
                self.logging_level = probe
        self.root.setLevel(self.logging_level)

        log_handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s:%(lineno)d - %(message)s')
        log_handler.setFormatter(formatter)
        self.root.addHandler(log_handler)

        # suppress info logging for globus_sdk loggers that are invoked,
        # while leaving my logging level in place
        logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                       'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                       'globus_sdk.transfer.paging',
                       'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient']
        for name in logger_list:
            logging.getLogger(name).setLevel(logging.ERROR)

        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)

        if env_logging_level and not self.get_logging_level(env_logging_level):
            self.log.warning("MC_ETL_WORKER_LOG_LEVEL = {} is not a valid logging level".
                             format(env_logging_level))

        return self.root

    def get_logging_level(self, key):
        if key in self.logging_level_table:
            return self.logging_level_table[key]
        return None

    def get_printable_log_level(self):
        level = self.logging_level
        level_list = list(self.logging_level_table.keys())
        if level < 10:
            return "level not set"
        index = (level // 10) - 1
        if index > 4:
            index = 4
        return level_list[index]
