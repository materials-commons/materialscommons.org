import rethinkdb as r

class GlobusAuthInfo:
    def __init__(self, owner, globus_name, globus_id, tokens):
        self.owner = owner
        self.otype = "globus_auth_info"
        self.globus_name = globus_name
        self.globus_id = globus_id
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.tokens = tokens
