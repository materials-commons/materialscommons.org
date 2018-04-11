import time
import random
import logging


def elt_globus_upload(task_status_id):
    log_name = "sim_globus_uplaod_" + str(task_status_id)
    log = logging.getLogger(log_name)

    from .TaskChain import TaskChain
    task_chain = TaskChain()
    wait = random.randint(1, 10) + 5
    log.debug("Starting ELT/Globus upload Task")
    log.debug("   simulated with wait: " + str(wait))
    time.sleep(wait)
    log.debug("   Chain: Queueing ELT/Excel processing")
    task_chain.queue_excel_processing(task_status_id)
    log.debug("Done ELT/Globus upload Task")


def etl_excel_processing(task_status_id):
    log_name = "sim_globus_uplaod_" + str(task_status_id)
    log = logging.getLogger(log_name)

    wait = random.randint(1,10) + 5
    log.debug("Starting Excel processing Task")
    log.debug("   simulated with wait: " + str(wait))
    time.sleep(wait)
    log.debug("Done Excel processing Task")
