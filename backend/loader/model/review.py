import rethinkdb as r

class Review(object):
    def __init__(self, author, assigned_to):
        self.title = ""
        self.author = author
        self.assigned_to = assigned_to
        self.messages = []
        self.items = []
        self.status = ""
        self.birthtime = r.now()
        self.project = ""
        self.modifiedtime = r.now()
