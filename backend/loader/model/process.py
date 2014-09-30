import rethinkdb as r


class Process(object):
    def __init__(self, name, owner, template_id, project_id,
                 machine, description):
        self.name = name
        self.owner = owner
        self.description = description
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.machine = machine
        self.template_id = template_id
        self.project_id = project_id
        self.version = ""
