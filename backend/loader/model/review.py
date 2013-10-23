import rethinkdb as r

class Review(object):
    def __init__(self, owner, who, note, item_name, item_id, when, rtype):
        self.owner = owner
        self.who = who
        self.note = note
        self.rtype = rtype
        self.item_name = item_name
        self.item_id = item_id
        self.marked_on = when
        self.birthtime = r.now()
        self.mtime = self.birthtime
