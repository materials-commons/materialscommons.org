import rethinkdb as r


class Sample(object):
    def __init__(self, owner, name, description):
        self.name = name
        self.owner = owner
        self.description = description
        self.supplier = ""
        self.alloy = ""

        # events is a list of property set ids. The order of the
        # ids determines the order that events happened.
        self.events = []
        self.birthtime = r.now()
        self.mtime = self.birthtime


class Element(object):
    def __init__(self, name, weight):
        self.name = name
        self.weight = weight
