import rethinkdb as r

class Review(object):
    def __init__(self, author, assigned_to):
        #self.requested_by = requested_by
        #self.requested_to = requested_to
        #self.note = ""
        self.title = ""
        self.author = author
        self.assigned_to = assigned_to
        self.messages = []
        self.item_id = ""
        self.item_type = ""
        self.item_name = ""
        self.status = ""
        self.birthtime = r.now()
        #self.project_id = ""
