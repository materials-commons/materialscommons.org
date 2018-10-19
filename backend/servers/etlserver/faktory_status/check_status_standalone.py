import logging
import pprint
import json

from ..utils.LoggingHelper import LoggingHelper
from .StatusClient import StatusClient
from .FaktoryStatus import FaktoryStatus

pp = pprint.PrettyPrinter(indent=4)


def main():
    log = logging.getLogger("Main")
    log.info("Starting main")
    client = StatusClient()
    status = None
    try:
        status = client.status()
        if status:
            status = json.loads(status)
    except ConnectionRefusedError as e:
        log.exception(e)

    if not status:
        log.info("Faktory Status information not available.")
        return

    status = FaktoryStatus(status)
    log.info("==== Faktory Status ====")
    log.info("  utc_time on server: {}".format(status.server_utc_time))
    log.info("  backup_count: {}".format(status.faktory.backup_task_count))
    log.info("  server command_count: {}".format(status.server.command_count))
    log.info("  server connections: {}".format(status.server.connections))
    log.info("  server faktory_version: {}".format(status.server.faktory_version))
    log.info("  server uptime: {}".format(status.server.uptime))
    log.info("  server used_memory_mb: {}".format(status.server.used_memory_mb))
    log.info("  tasks: total_enqueued: {}".format(status.faktory.total_enqueued))
    log.info("  tasks: total_failures: {}".format(status.faktory.total_failures))
    log.info("  tasks: total_processed: {}".format(status.faktory.total_processed))
    log.info("  tasks: total_queues: {}".format(status.faktory.total_queues))
    log.info("  tasks...")
    for task in status.faktory.tasks:
        if task.main_type == 'simple':
            log.info("    {}: size={}, reaped={}".format(task.element_type, task.size, task.reaped))
        else:
            log.info("    {}: size={}, cycles={}, enqueued={}, wall_time_sec={}".format(
                task.element_type, task.size, task.cycles, task.enqueued, task.wall_time_sec
            ))


if __name__ == "__main__":
    LoggingHelper().set_root()
    setup_log = logging.getLogger("Main_setup")
    setup_log.info("Starting main setup")
    main()
