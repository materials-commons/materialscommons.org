import rethinkdb as r


class Note2Item(object):
    def __init__(self, item_id, item_type, note_id):
        self.item_id = item_id
        self.item_type = item_type
        self.note_id = note_id
        pass