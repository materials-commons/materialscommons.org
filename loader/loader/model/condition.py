import rethinkdb as r

class Condition(object):
    def __init__(self, ctype, name):
        self.ctype = ctype
        self.name = name
        self.properties = []
        self.birthtime = r.now()
        self.mtime = self.birthtime
