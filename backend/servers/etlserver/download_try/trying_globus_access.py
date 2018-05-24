import sys
import time

from globus_sdk.exc import GlobusAPIError
from globus_sdk import TransferClient

from backend.servers.etlserver.download_try.GlobusAccess import GlobusAccess


SOURCE_ENDPOINT_NAME = 'PortalEndpoint'
SOURCE_PATH = '/transfer test/'


def main():

    # ------------------------ Authenticate Block ---------------------------
    globus_access = GlobusAccess()
    # -- end Authenticate Block
    # ----------------------------- Access block  --------------------------

    transfer = TransferClient(authorizer=globus_access.authorizer)

    source_id = globus_access.get_ep_id(transfer, SOURCE_ENDPOINT_NAME)

    if not source_id:
        print("Source endpoint '{}' not found".format(SOURCE_ENDPOINT_NAME))
        exit(-1)

    # print out a directory listing from an endpoint
    try:
        transfer.endpoint_autoactivate(source_id)
    except GlobusAPIError as ex:
        print(ex)
        if ex.http_status == 401:
            sys.exit('Refresh token has expired. '
                     'Please delete refresh-tokens.json and try again.')
        else:
            raise ex

    for entry in transfer.operation_ls(source_id, path=SOURCE_PATH):
        print(entry['name'] + ('/' if entry['type'] == 'dir' else ''))

    # -- end Access block

    # ---------------------------- Re anthentication test ---------------------

    # revoke the access token that was just used to make requests against
    # the Transfer API to demonstrate that the RefreshTokenAuthorizer will
    # automatically get a new one
    globus_access.auth_client.oauth2_revoke_token(globus_access.authorizer.access_token)
    # Allow a little bit of time for the token revocation to settle
    time.sleep(1)
    # Verify that the access token is no longer valid
    token_status = globus_access.auth_client.oauth2_validate_token(
        globus_access.transfer_tokens['access_token'])
    assert token_status['active'] is False, 'Token was expected to be invalid.'

    print('\nDoing a second directory listing with a new access token:')
    for entry in transfer.operation_ls(source_id, path=SOURCE_PATH):
        print(entry['name'] + ('/' if entry['type'] == 'dir' else ''))


if __name__ == '__main__':
    main()
