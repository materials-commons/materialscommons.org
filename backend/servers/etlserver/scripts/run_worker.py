import sys
import logging
from ..faktory.EtlFaktoryWorker import EtlFaktoryWorker as Worker


def main():
    log = logging.getLogger("top_level_run_worker")
    worker = Worker()
    # Note: runs "forever"
    log.info("Run ETL worker")
    worker.run()


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    # suppress info logging for globus_sdk loggers that are invoked, while leaving my info logging in place
    logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                   'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                   'globus_sdk.transfer.paging',
                   'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient']
    for name in logger_list:
        logging.getLogger(name).setLevel(logging.ERROR)

    main()
