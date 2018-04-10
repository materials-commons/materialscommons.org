import rethinkdb as r


class BackgroundProcess:
    # Status tags
    INITIALIZATION = "Initialization"
    VERIFYING_SETUP = "Verifying Setup"
    SUBMITTED_TO_QUEUE = "Submitted to queue"
    RUNNING = "Running"
    FAIL = "Fail"
    SUCCESS = "Success"

    def __init__(self, owner, project_id, name, description=None):
        self.owner = owner
        self.otype = "background_process"
        self.project_id = project_id
        if not description:
            description = name + "; Status for project: " + project_id
        self.name = name
        self.description = description
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.status = self.INITIALIZATION
        self.queue = None
        self.extras = {}
