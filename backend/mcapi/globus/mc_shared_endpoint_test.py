import globus.my_globus_tools as support

BASE_ENDPOINT = "Weymouth Mac Desktop"
SHARE_PATH_ON_BASE = "/Volumes/Data2/GlobusEndpoint/mc-base/Project - Demo_Project - e4fd5c88"
SHARE_ENDPOINT = "Weymouth Desktop Code Generated Share"
ENDPOINT_PATH = "/"


try:
    transfer = support.get_transfer_interface()
    if not transfer:
        print("No transfer interface")
        exit(-1)
    print("Transfer Interface Found")
    shared_endpoint_id = support.get_ep_id(transfer, SHARE_ENDPOINT)
    if not shared_endpoint_id:
        print ("Shared endpoint not found. Creating ", SHARE_ENDPOINT)
        shared_endpoint_id = support.create_shared_ep(
            transfer, BASE_ENDPOINT, SHARE_PATH_ON_BASE, SHARE_ENDPOINT)
    if not shared_endpoint_id:
        print("No shared endpoint client")
        exit(-1)
    print("Client ID Found for share endpoint: " + SHARE_ENDPOINT)
    print("    - id is ", shared_endpoint_id)
    print("    - listing entries in endpoint path: " + ENDPOINT_PATH)
    #for entry in transfer.operation_ls(shared_endpoint_id, path=ENDPOINT_PATH):
    #    print(entry['name'] + ('/' if entry['type'] == 'dir' else ''))
    # obtain user uuid for materialscommonstest@globusid.org
    # add user access permission to shared endpoint and path (read, write)
    user_to_add = "ec5d8b49-726c-44d7-a0cd-1d11e607a2f0"
    rule = support.acl_rule_exists(transfer, user_to_add, shared_endpoint_id, ENDPOINT_PATH)
    print("rule exists: ", rule)
    if (rule):
        permissions = rule['permissions']
        if not permissions == "rw":
            print("not this: ", permissions)
            support.acl_change_rule_permissions(transfer, shared_endpoint_id, rule['id'], "rw")
        else:
            print("Permissions ok.")
    else:
        print("Creating rule...")
        support.acl_add_rule(transfer, user_to_add, shared_endpoint_id, ENDPOINT_PATH, "rw")
        print("Created rule")

    url = "https://www.globus.org/app/transfer?" + \
          "&origin_id=" + shared_endpoint_id + \
          "&origin_path=" + ENDPOINT_PATH + \
          "&add_identity=" + user_to_add
    print(url)
except Exception as problem:
    print("Oops")
    print(problem)
