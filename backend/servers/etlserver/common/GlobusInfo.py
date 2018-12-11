import logging
import os

from ..download.GlobusAccess import GlobusAccess
from ..download.GlobusAccess import CONFIDENTIAL_CLIENT_APP_AUTH


class GlobusInfo:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("GlobusInfo init")

    def get_all(self):
        # return public information on the detail of the Materials Commons Globus interface
        self.log.info("get_all called")
        access = GlobusAccess()

        implementation_method = access.get_impl_type()
        if not implementation_method == CONFIDENTIAL_CLIENT_APP_AUTH:
            ret = {"error": "Access information not available: not Confidential Client"}
            self.log.error("Access mis-configured: {} = {}".format(ret['error'], implementation_method))
            return ret

        self.log.info("calling get user")
        confidential_client_user_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
        user = access.get_globus_user_by_id(confidential_client_user_id)
        self.log.info("user = {}".format(user))

        ret = {
            "upload_user_name": user['name'],
            "upload_user_unique_name": user['username'],
            "upload_user_id": user['id']
        }
        self.log.info("get_all returns: {}".format(ret))
        return ret
