import rethinkdb as r

class Project(object):
    def __init__(self, datadir, owner):
        self.name = ""
        self.description = ""
        self.datadir = datadir
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.notes = []
        self.tags = []
        self.reviews = []
        self.mytags = []
