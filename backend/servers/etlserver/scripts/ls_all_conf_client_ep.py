import os
import configparser

from globus_sdk import (
    ConfidentialAppAuthClient, ClientCredentialsAuthorizer, TransferClient
)
from globus_sdk.exc import AuthAPIError


class ConfidentialClientHelper:
    def __init__(self, configuration_file_path):
        if not self.configuration_file_check(configuration_file_path):
            print("====")
            print("ERROR: the configuration file is missing, {}".format(configuration_file_path))
            print("====")
            exit(-1)
        configuration = configparser.ConfigParser()
        configuration.read(configuration_file_path)
        self.conf = configuration

    def ls(self):
        config = self.conf
        for s_key in config.sections():
            self.ls_cc(s_key, config[s_key]['id'], config[s_key]['pw'])
        print('-' * 82)

    def ls_cc(self, name, id, pw):
        self.print_header(name, id)
        try:
            auth_client = ConfidentialAppAuthClient(client_id=id, client_secret=pw)
            scopes = "urn:globus:auth:scope:transfer.api.globus.org:all"
            cc_authorizer = ClientCredentialsAuthorizer(auth_client, scopes)
            transfer_client = TransferClient(authorizer=cc_authorizer)
            results = transfer_client.endpoint_search(filter_scope="my-endpoints")
            endpoint_list = list(results)
            if endpoint_list:
                print("Owned endpoints:")
                for ep in endpoint_list:
                    print("{} ({})".format(ep['display_name'],ep['id']))
            else:
                print("(No owned endpoints.)")
            results = transfer_client.endpoint_search(filter_scope="shared-with-me")
            endpoint_list = list(results)
            if endpoint_list:
                print("Shared endpoints:")
                for ep in endpoint_list:
                    print("{} ({})".format(ep['display_name'], ep['id']))
            else:
                print("(No shared endpoints.)")
        except AuthAPIError as e:
            print(e)

    @staticmethod
    def print_header(name, id):
        name_id = '{}({})'.format(name, id)
        print('-'*82)
        print('|{:^80}|'.format(''))
        print('|{:^80}|'.format(name_id))
        print('|{:^80}|'.format(''))
        print('-'*82)

    @staticmethod
    def configuration_file_check(path):
        return os.path.exists(path)


def main(config_file_path):
    helper = ConfidentialClientHelper(config_file_path)
    helper.ls()


if __name__=="__main__":
    config_file_path = os.path.join(os.environ.get('HOME'),".materialscommons","cc.ini")
    main(config_file_path)
