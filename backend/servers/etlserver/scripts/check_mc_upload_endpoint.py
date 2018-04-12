import os
import configparser
from ..globus_etl.MaterialsCommonsGlobusInterface import MaterialsCommonsGlobusInterface
from globus_sdk.exc import GlobusAPIError


def main():

    config_path = os.environ.get("MC_CONFIDENTIAL_CLIENT_CONFIG_FILE", None)

    if not config_path:
        print("  Missing 'MC_CONFIDENTIAL_CLIENT_CONFIG_FILE' ")
        print("     which appears not to be set")
        exit(-1)

    if not (os.path.isfile(config_path)):
        print("  Missing configuration file for the Materials Commons Confidential Client")
        print("    path = " + str(config_path))
        exit(-1)

    config = configparser.ConfigParser()
    config.read(str(config_path))

    client_user = None
    client_token = None
    mc_target_ep_id = None
    try:
        client_user = config['mc_client']['user']
        client_token = config['mc_client']['token']
        mc_target_ep_id = config['mc_client']['ep_id']
    except KeyError:
        pass

    if not (client_user and client_token and mc_target_ep_id):
        message = "Missing configuration information for the Materials Commons Confidential Client"
        message += "\n  config file: " + str(config_path)
        if not client_user:
            message += "\n  missing client user id"
        if not client_token:
            message += "\n  missing client login token"
        if not mc_target_ep_id:
            message += "\n  missing client endpoint UUID"
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