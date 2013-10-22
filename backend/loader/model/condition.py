import rethinkdb as r

class Condition(object):
    def __init__(self, ctype, name):
        self.ctype = ctype
        self.name = name
        self.properties = dict()
        self.birthtime = r.now()
        self.mtime = self.birthtime

    def add_condition(self, name, value):
        self.properties[name] = value

    def get_condition(self, name):
        return self.properties[name]

    def has_condition(self, name):
        return name in self.properties
