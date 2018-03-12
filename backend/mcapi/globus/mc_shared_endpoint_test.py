import globus.my_globus_tools as support

BASE_ENDPOINT = "MC On Weymouth Laptop"
SHARE_PATH_ON_BASE = "/Volumes/Data2/GlobusEndpoint/mc-base/Project - Demo_Project - e4fd5c88"
SHARE_ENDPOINT = "Weymouth on Materials Commons"
ENDPOINT_PATH = "/"


try:
    transfer = support.get_transfer_interface()
    if not transfer:
        print("No transfer interface")
        exit(-1)
    print("Transfer Interface Found")
    client_id = support.get_ep_id(transfer, SHARE_ENDPOINT)
    if not client_id:
        print ("Shared endpoint not found. Creating ", SHARE_ENDPOINT)
        client_id = support.create_shared_ep(
            transfer, BASE_ENDPOINT, SHARE_PATH_ON_BASE, SHARE_ENDPOINT)
    if not client_id:
        print("No shared endpoint client")
        exit(-1)
    print("Client ID Found")
    for entry in transfer.operation_ls(client_id, path=ENDPOINT_PATH):
        print(entry['name'] + ('/' if entry['type'] == 'dir' else ''))
except:
    print("Oops")
