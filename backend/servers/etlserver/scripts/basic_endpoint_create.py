import logging
from pathlib import Path

from ..utils.LoggingHelper import LoggingHelper
from ..download.GlobusAccess import GlobusAccess, NATIVE_APP_AUTH

TOKEN_FILE_PATH = Path(Path.home(), '.globus', 'refresh-testing-tokens.json')
REDIRECT_URI = 'https://auth.globus.org/v2/web/auth-code'
SCOPES = ('openid email profile '
          'urn:globus:auth:scope:transfer.api.globus.org:all')


class BasicEndpointExample:
    def __init__(self, base_endpoint, globus_access):
        self.log = logging.getLogger(self.__class__.__name__)
        self.globus_access = globus_access
        self.base_endpoint = base_endpoint

    def do_it(self):
        ep_list = self.globus_access.my_shared_endpoint_list(self.base_endpoint)
        for ep in ep_list:
            self.log.info("ep = {}".format(ep['display_name']))
        data = {
            "DATA_TYPE": "shared_endpoint",
            "host_endpoint": self.base_endpoint,
            "host_path": '/Volumes/Data2/GlobusEndpoint/sharing/share_for_test_of_transfer/create_ep_test/',
            "display_name": "Testing create-endpoint",
            # optionally specify additional endpoint fields
            # "description": "my test share"
        }
        self.globus_access.create_shared_endpoint(data)


def main(base_ep):
    main_log = logging.getLogger("main")
    main_log.info("Starting main")

    globus_access = GlobusAccess(use_implementation=NATIVE_APP_AUTH)

    BasicEndpointExample(base_ep, globus_access).do_it()


if __name__ == '__main__':
    LoggingHelper().set_root()
    startup_log = logging.getLogger("main-setup")
    startup_log.info("Starting main-setup")

    # should be a CLI parameter
    my_base_endpoint = 'd35abd9a-86d6-11e8-9571-0a6d4e044368'

    main(my_base_endpoint)
