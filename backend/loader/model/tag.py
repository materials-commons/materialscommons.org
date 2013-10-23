import rethinkdb as r

class Tag(object):
    def __init__(self, name):
        self.id = name
        self.birthtime = r.now()
        self.notes = []
        self.description = ""

class UserTag(Tag):
    def __init__(self, name, owner):
        super(UserTag, self).__init__(name)
        self.owner = owner
