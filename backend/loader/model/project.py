import rethinkdb as r


class Project(object):
    def __init__(self, name, datadir, owner):
        self.name = name
        self.description = ""
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.mediatypes = {}
        self.size = 0
        self._type = "project"
