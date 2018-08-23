import globus_sdk
import os


def main():

    print("start")

    _MC_CC_ID = os.environ.get('MC_CONFIDENTIAL_CLIENT_USER')
    _MC_CC_PW = os.environ.get('MC_CONFIDENTIAL_CLIENT_PW')

    print(_MC_CC_ID)
    print(_MC_CC_PW)

    redirect_uri = "https://localhost:5880/globus_auth_callback"
    client = globus_sdk.ConfidentialAppAuthClient(_MC_CC_ID, _MC_CC_PW)
    print(client)
    client.oauth2_start_flow(redirect_uri, refresh_tokens=True)
    auth_uri = client.oauth2_get_authorize_url()
    print("Auth UIR = {}".format(auth_uri))

    print("done")

if __name__ == '__main__':
    main()
