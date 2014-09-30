import rethinkdb as r


class Note(object):
    def __init__(self, who, text, title, item_id, item_type):
        self.birthtime = r.now()
        self.who = who
        self.text = text
        self.title = title
        self.item_id = item_id
        self.item_type = item_type
