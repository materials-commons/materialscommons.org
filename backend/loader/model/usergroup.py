import rethinkdb as r

class UserGroup:
    def __init__(self, owner, name):
        self.id = name
        self.owner = owner
        self.name = name
        self.description = name
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.access = 'private'
        self.users = []
