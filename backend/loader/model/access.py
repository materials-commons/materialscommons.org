import rethinkdb as r


class Access(object):
    def __init__(self, user_id, project_id, project_name, assigned_to):
        self.user_id = user_id
        self.project_id = project_id
        self.project_name = project_name
        self.dataset = ""
        self.permissions = ""
        self.status = ""
        self.birthtime = r.now()
        self.mtime = self.birthtime
