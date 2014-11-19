import rethinkdb as r


class DataDir(object):
    def __init__(self, name, userid, parent, project):
        self.owner = userid
        self.marked_for_review = False
        self.name = name
        self.datafiles = []
        self.parent = parent
        self.reviews = []
        self.project = project
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.atime = self.birthtime
