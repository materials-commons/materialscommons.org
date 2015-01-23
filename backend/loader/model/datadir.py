import rethinkdb as r


class DataDir(object):
    def __init__(self, name, userid, parent, project):
        self.owner = userid
        self.name = name
        self.parent = parent
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self._type = "datadir"
