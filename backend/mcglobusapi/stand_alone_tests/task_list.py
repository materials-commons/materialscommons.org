import os.path as os_path
import configparser

from globus_sdk import ConfidentialAppAuthClient, ClientCredentialsAuthorizer
from globus_sdk import TransferClient


def main():
    home = os_path.expanduser("~")
    config_path = os_path.join(home, '.mcglobusapi', 'mc_client_config.ini')

    config = configparser.ConfigParser()
    config.read(str(config_path))

    client_user = config['mc_client']['user']
    client_token = config['mc_client']['token']

    auth_client = ConfidentialAppAuthClient(
        client_id=client_user, client_secret=client_token)

    scopes = "urn:mcglobusapi:auth:scope:transfer.api.mcglobusapi.org:all"
    cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
    transfer_client = TransferClient(authorizer=cc_authorizer)

    for task in transfer_client.task_list():
        task_id = task["task_id"]
        task_status = task['status']
        task_other_status = task['nice_status']
        print("Task({}): {} - {}".format(task_id, task_status, task_other_status))


if __name__ == "__main__":
    main()
