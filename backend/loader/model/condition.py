import rethinkdb as r

class Condition(object):
    def __init__(self):
        self.model = dict()
        self.owner = ''
        self.birthtime = r.now()
        self.sample_id = ''
        self.template = ''