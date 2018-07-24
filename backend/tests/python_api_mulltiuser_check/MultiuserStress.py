import logging
from multiprocessing import Process
from .Worker import Worker
from .task_call import task_call
from .DatabaseInterface import DatabaseInterface
from .User import make_fake_user

class MultiuserStress:
    def __init__(self, number_of_users):
        self.log = logging.getLogger(self.__class__.__name__)
        self.number_of_users = number_of_users
        self.log.info("init: number_of_users = {}".format(self.number_of_users))
        self.worker_list = []
        self.process_list = []

    def setup(self):
        db = DatabaseInterface()
        for i in range(0, self.number_of_users):
            worker_name = "worker-%03d" % i
            user_name = "user-%03d" % i
            apikey = "bogus-key-%03d" % i
            user_id = '{}@mc.test'.format(user_name)
            self.make_sure_user_exists(db, user_name, user_id, apikey)
            w = Worker(worker_name, apikey)
            self.worker_list.append(w)
            p = Process(target=task_call, args=(w,))
            self.process_list.append(p)
            self.log.info("Completed setup for worker{}".format(worker_name))

    def run(self):
        for p in self.process_list:
            p.start()
        for p in self.process_list:
            p.join()

    def make_sure_user_exists(self, db, user_name, user_id, apikey):
        exists = db.get_user_by_id(user_id)
        if exists:
            self.log.info("id = {}, exists".format(user_id))
            return
        self.log.info("id = {}, does not exists - creating".format(user_id))
        user = make_fake_user(user_name, user_id, 'test', apikey)
        db.add_user(user)