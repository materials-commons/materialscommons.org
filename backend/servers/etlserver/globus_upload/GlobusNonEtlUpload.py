class GlobusNonEtlUpload:

    def __init__(self, project_owner, project_id, globus_endpoint):
        self.project_owner = project_owner
        self.project_id = project_id
        self.globus_endpoint = globus_endpoint
        self.last_status = None

    def initialize(self):
        pass

    def start(self):
        pass

    def is_running(self):
        pass

    def get_last_status(self):
        return self.last_status
