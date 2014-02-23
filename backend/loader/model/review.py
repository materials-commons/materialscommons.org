import rethinkdb as r

class Review(object):
    def __init__(self, requested_by, requested_to):
        self.requested_by = requested_by
        self.requested_to = requested_to
        self.note = ""
        self.item_id = ""
        self.item_type = ""
        self.item_name = ""
        self.status = ""
        self.birthtime = r.now()
        self.project_id = ""
