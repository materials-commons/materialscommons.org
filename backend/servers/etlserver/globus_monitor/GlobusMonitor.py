import logging
from ..utils.ConfClientHelper import ConfClientHelper
from ..common.GlobusAccess import GlobusAccess


class GlobusMonitor:

    def __init__(self, mc_user_id, project_id, endpoint):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
