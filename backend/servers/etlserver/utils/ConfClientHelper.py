import time
import logging
from ..common.GlobusAccess import GlobusAccess


class ConfClientHelper:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("Starting ConfClientHelper")
        self.access = GlobusAccess()
        self.monitor_list = []
        self.task_list = []

    def setup(self, full=None):
        task_list = self.access.task_list()
        self.task_list = []
        for task in task_list:
            if not task['DATA_TYPE'] == 'task' or not task['type'] == 'TRANSFER':
                break
            self.task_list.append(task)
        if full:
            self.monitor_list = self.task_list
        else:
            self.monitor_list = self.find_active()

    def monitor(self, loops):
        run = True
        for i in range(0, loops):
            if not run:
                break
            self.setup()
            self.report(loop=i+1)
            if (i+1) < loops:
                time.sleep(20)
            run = (len(self.monitor_list) > 1)

    def report(self, task_id=None, loop=None):
        first = True
        if loop:
            print('====== loop: {}'.format(loop))
        else:
            print('======')
        for task in self.monitor_list:
            if task_id and not task['task_id'] == task_id:
                continue
            if first:
                first = False
            else:
                print('----')
            line1 = "from {} to {}"
            line2 = "    task_id = {}"
            line3 = "    status = {}, directories = {}, files = {}({})  -> {:.2f}"
            percent_complete = (task['files_transferred']/task['files']) * 100
            print(line1.format(
                task['source_endpoint_display_name'],
                task['destination_endpoint_display_name']
            ))
            print(line2.format(
                task['task_id']
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

    def cancel(self, task_id):
        self.access.cancel_task(task_id)
