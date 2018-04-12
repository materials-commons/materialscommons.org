import sys
import time
import logging

from ..BackgroundProcess import BackgroundProcess
from ..DatabaseInterface import DatabaseInterface


def main():
    from ..globus_etl.task_library import startup_and_verify
    log = logging.getLogger("top_level_run_ELT_example")

    user_id = "test@test.mc"
    project_id = "c4cf1777-af3b-437f-82af-2d4c1810b8a3"
    experiment_name = "Test from excel"
    experiment_description = "An experiment built via etl from test data"
    globus_endpoint = "067ce67a-3bf1-11e8-b9b5-0ac6873fc732"
    endpoint_path = "/dataForTest"
    request_uuid = project_id
    excel_file_relative_path = "input.xlsx"
    data_dir_relative_path = "data"

    log.info("user_id = " + user_id)
    log.info("project_id = " + project_id)
    log.info("experiment_name = " + experiment_name)
    log.info("experiment_description = " + experiment_description)
    log.info("globus_endpoint = " + globus_endpoint)
    log.info("endpoint_path = " + endpoint_path)
    log.info("request_uuid = " + request_uuid)
    log.info("excel_file_relative_path = " + excel_file_relative_path)
    log.info("data_dir_relitive_path = " + data_dir_relative_path)

    # suppress info logging for globus_sdk loggers that are invoked, while leaving my info logging in place
    logger_list = ['globus_sdk.authorizers.basic', 'globus_sdk.authorizers.client_credentials',
                   'globus_sdk.authorizers.renewing', 'globus_sdk.transfer.client.TransferClient',
                   'globus_sdk.auth.client_types.confidential_client.ConfidentialAppAuthClient']
    for name in logger_list:
        logging.getLogger(name).setLevel(logging.ERROR)

    results = startup_and_verify(user_id, project_id, experiment_name, experiment_description,
                                 globus_endpoint, endpoint_path,
                                 excel_file_relative_path, data_dir_relative_path)

    if not results['status'] == "SUCCESS":
        log.error("Setup failed.")
        return

    tracking_id = results['status_record_id']
    status = BackgroundProcess.INITIALIZATION
    while (not status == BackgroundProcess.SUCCESS) and (not status == BackgroundProcess.FAIL):
        status_record = DatabaseInterface().get_status_record(tracking_id)
        status = status_record['status']
        queue = status_record['queue']
        log.info("Status = {}; Queue = {}".format(status, queue))
        time.sleep(2)


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.DEBUG)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    main()
