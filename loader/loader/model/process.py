import rethinkdb as r

class Process(object):
    def __init__(self, name, owner, machine, process_type, description, parent=None):
        self.name = name
        self.owner = owner
        self.description = description
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
