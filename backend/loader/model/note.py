import rethinkdb as r


class Note(object):
    def __init__(self, who, text, title, project_id):
        self.birthtime = r.now()
        self.mtime = r.now()
        self.owner = who
        self.note = text
        self.title = title
        self.project_id = project_id
        self._type = "note"