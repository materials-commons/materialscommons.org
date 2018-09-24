import logging

from .non_etl_task_library import startup_and_verify


class GlobusUpload:

    def __init__(self, mc_user_id, project_id, endpoint, path):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.mc_user_id = mc_user_id
        self.project_id = project_id
        self.globus_endpoint = endpoint
        self.endpoint_path = path
        self.log.info("init - done")

    def setup_and_verify(self):
        self.log.info("starting setup_and_verify")
        results = startup_and_verify(self.mc_user_id, self.project_id, self.globus_endpoint, self.endpoint_path)
        self.log.info("setup_and_verify results = {}".format(results))
        return results
