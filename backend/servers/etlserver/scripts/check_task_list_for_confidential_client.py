import os
import time
import logging
from ..utils.LoggingHelper import LoggingHelper
from ..common.GlobusAccess import GlobusAccess


class MonitorTaskList:
    def __init__(self):
        self.access = GlobusAccess()
        self.monitor_list = []
        self.task_list = []

    def setup(self):
        task_list = self.access.task_list()
        self.task_list = []
        for task in task_list:
            if not task['DATA_TYPE'] == 'task' or not task['type'] == 'TRANSFER':
                break
            self.task_list.append(task)
        self.monitor_list = self.find_active()

    def main(self):
        run = True
        print(self.task_list[0])
        while run:
            self.setup()
            self.report()
            time.sleep(20)
            run = (len(self.monitor_list) > 1)

    def report(self):
        first = True
        print('======')
        for task in self.monitor_list:
            if first:
                first = False
            else:
                print('----')
            line1 = "from {} to {}"
            line3 = "    status = {}, directories = {}, files = {}({})  -> {:.2f}"
            percent_complete = (task['files_transferred']/task['files']) * 100
            print(line1.format(
                task['source_endpoint_display_name'],
                task['destination_endpoint_display_name']
            ))
            print(line3.format(
                task['status'], task['directories'],
                task['files'], task['files_transferred'],
                percent_complete
            ))
        print('======')

    def find_active(self):
        ret_list = []
        for task in self.task_list:
            if task['status'] == "ACTIVE":
                ret_list.append(task)
        for task in self.task_list:
            if task['status'] != 'ACTIVE':
                ret_list.append(task)
                break
        return ret_list


if __name__ == "__main__":
    LoggingHelper().set_root()
    local_log = logging.getLogger("main-setup")

    env_list = ['MC_CONFIDENTIAL_CLIENT_USER', 'MC_CONFIDENTIAL_CLIENT_PW']

    print("")
    env_values = {}
    missing = []
    for env_name in env_list:
        env_value = os.environ.get(env_name)
        env_values[env_name] = env_value
        if not env_value:
            missing.append(env_name)
    if missing:
        message = "Missing environment values: {}".format(", ".join(missing))
        local_log.error(message)
        exit(-1)

    monitor = MonitorTaskList()
    monitor.setup()
    monitor.main()
