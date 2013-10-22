import rethinkdb as r

class Run(object):
    def __init__(self):
        self.started = r.now()
        self.stopped = 0
        self.error_messages = []
