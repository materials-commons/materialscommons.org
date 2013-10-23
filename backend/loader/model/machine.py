import rethinkdb as r

class Machine(object):
    def  __init__(self, name, longname, contact):
        self.name = name
        self.longname = longname
        self.birthtime = r.now()
        self.contact = contact
        self.notes = []
