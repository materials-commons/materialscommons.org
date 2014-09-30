import rethinkdb as r


class Sample(object):
    def __init__(self, owner):
        self.name = ""
        self.composition = ""
        self.owner = owner
        self.events = []
        self.birthtime = r.now()
