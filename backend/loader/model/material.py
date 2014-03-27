import rethinkdb as r

class Material(object):
    def __init__(self):
        # Currently a text field but probably needs to be
        # a more complex object.
        self.alloy = ""

        self.birthtime = r.now()

        # The name of the entry
        self.name = ""

        # A list of Note entries
        self.notes = []

        # A list of ModelItem entries
        self.additional = []
