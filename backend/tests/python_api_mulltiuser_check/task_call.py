import logging


def task_call(worker):
    main_log = logging.getLogger("task_call")
    main_log.info("Starting worker {}".format(worker.name))
    worker.run()
    main_log.info("Finished worker {}".format(worker.name))
