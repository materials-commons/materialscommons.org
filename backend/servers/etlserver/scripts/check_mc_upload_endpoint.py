import os
import configparser
from ..globus_etl.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from globus_sdk.exc import GlobusAPIError


def main():

    client_user = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
    client_token = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')
    mc_target_ep_id = os.environ.get('MC_CONFIDENTIAL_CLIENT_ENDPOINT')

    if (not client_user) or (not client_token) or (not mc_target_ep_id):
        missing = []
        if not client_user:
            missing.append('MC_CONFIDENTIAL_CLIENT_USER')
        if not client_token:
            missing.append('MC_CONFIDENTIAL_CLIENT_PW')
        if not mc_target_ep_id:
            missing.append("MC_CONFIDENTIAL_CLIENT_ENDPOINT")
        message = "Missing environment values: {}".format(", ".join(missing))
        print(message)
        exit(-1)

    interface = MaterialsCommonsGlobusInterface("does-not-matter")
    try:
        interface.set_transfer_client()
    except GlobusAPIError as e:
        http_status = e.http_status
        code = e.code
        details = e.message
        message = "Unable to connect to the Globus Connection server (based on configuration information): "
        message += " http_status = " + str(http_status)
        message += ", code = " + code
        message += ", message = " + details
        print(message)
        exit(-1)

    print("")
    exit(0)


if __name__ == "__main__":
    main()
