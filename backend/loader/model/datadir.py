import rethinkdb as r

class DataDir(object):
    def __init__(self, name, access, userid, parent):
        self.access = access
        self.owner = userid
        self.marked_for_review = False
        self.name = name
        self.datafiles = []
        self.dataparams = []
        self.users = []
        self.tags = []
        self.mytags = []
        self.users.append(userid)
        self.parent = parent
        self.reviews = []
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.atime = self.birthtime
        #self.id = userid + "$" + name.replace('/', '_')