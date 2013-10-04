import rethinkdb as r

class Machine(object):
    def  __init__(self, longname, shortname, contact):
        self.shortname = ""
        self.longname = ""
        self.birthtime = r.now()
        self.contact = contact
        self.notes = []
