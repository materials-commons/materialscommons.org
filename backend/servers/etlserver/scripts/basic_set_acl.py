import logging
from pathlib import Path

from ..utils.LoggingHelper import LoggingHelper
from ..common.GlobusAccess import GlobusAccess, NATIVE_APP_AUTH

TOKEN_FILE_PATH = Path(Path.home(), '.globus', 'refresh-testing-tokens.json')
REDIRECT_URI = 'https://auth.globus.org/v2/web/auth-code'
SCOPES = ('openid email profile '
          'urn:globus:auth:scope:transfer.api.globus.org:all')


class BasicACLExample:
    def __init__(self, globus_access):
        self.log = logging.getLogger(self.__class__.__name__)
        self.log.info("BasicACLExample.__init__()")
        self.globus_access = globus_access

    def do_it(self, globus_user_name, ep_id, path, permissions):
        ret = self.globus_access.get_globus_user(globus_user_name)
        globus_user_id = ret['id']
        results = self.globus_access.set_acl_rule(
            ep_id, path, globus_user_id, permissions)
        self.log.info("Results from setting acl rule = {}".format(results))


if __name__ == '__main__':
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")
    startup_log.info("Starting main-setup")

    #These should be command line params
    # endpoint_id is the endpoint on which to set acl (a shared endpoint)
    endpoint_id = 'caeb35c2-ad1e-11e8-823c-0a3b7ca8ce66'
    # endpoint_path
    endpoint_path = '/'
    # globus_user_id - the globus user that is in the ACL rule
    globus_user_name = "glenn.tarcea@gmail.com"
    # permissions for the ACL Rule ("r" "rw" or 'delete' to delete that acl rule)
    permissions = "rw"

    globus_access = GlobusAccess(use_implementation=NATIVE_APP_AUTH)

    BasicACLExample(globus_access).do_it(globus_user_name, endpoint_id, endpoint_path, permissions)
