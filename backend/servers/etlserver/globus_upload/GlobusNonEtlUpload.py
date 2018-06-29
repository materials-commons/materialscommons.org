import logging

from ..globus_etl.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface

class GlobusNonEtlUpload:

    def __init__(self, project_owner, project_id, globus_endpoint):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.project_owner = project_owner
        self.project_id = project_id
        self.globus_endpoint = globus_endpoint
        self.last_status = None
        self.service = MaterialsCommonsGlobusInterface(project_owner)
        self.service.set_transfer_client()
        self.log.info("init - done")

    def start(self, transfer_id):
        self.log.info("start")
        results = self.service.stage_upload_files(
            self.project_id, transfer_id, self.globus_endpoint, '/')
        self.log.info("start results = {}".fomat(results))

    def is_running(self):
        pass

    def get_last_status(self):
        return self.last_status
