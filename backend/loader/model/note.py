import rethinkdb as r


class Note(object):
    def __init__(self, who, text, title, item_id, item_type, project_id):
        self.birthtime = r.now()
        self.mtime = r.now()
        self.creator = who
        self.note = text
        self.title = title
        self.item_id = item_id
        self.item_type = item_type
        self.project_id = project_id
