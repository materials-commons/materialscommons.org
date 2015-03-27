import rethinkdb as r

class Tag(object):
    def __init__(self, name, owner):
        self.id = name
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.owner = self.owner
