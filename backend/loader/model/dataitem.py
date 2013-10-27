import rethinkdb as r

class DataItem(object):
    def __init__(self, name, access, owner, item_type):
        self.item_type = item_type
        self.name = name
        self.access = access
        self.marked_for_review = False
        self.reviews = []
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.atime = self.birthtime
        self.tags = []
        self.mytags = []
        self.description = name
        self.notes = []
        self.owner = owner
        self.process = ""
        self.machine = ""
