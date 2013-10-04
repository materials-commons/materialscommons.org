import rethinkdb as r

class Process(object):
    def __init__(self, name, owner, machine, process_type, parent=None):
        self.name = name
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.machine = machine
        self.process_type = process_type
        self.version = ""
        self.parent = parent
        self.notes = []
        self.inputs = []
        self.outputs = []
        self.runs = []
        self.citations = []
        self.status = ""
