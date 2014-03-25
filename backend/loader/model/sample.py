import rethinkdb as r

class Sample(object):
    def __init__(self, model , owner):
        self.model = model
        self.owner = owner
        self.birthtime = r.now()