import rethinkdb as r

class Sample(object):
    def __init__(self, model, owner):
        self.name = ""
        self.composition = ""
        self.notes = []
        self.treatments = {}
        self.treatments_order = []
        self.properties = {}
        self.owner = ""
        self.created_by = ""
        self.birthtime = r.now()
