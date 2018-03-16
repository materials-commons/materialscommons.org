import configparser
from pathlib import Path

import globus_sdk

home = str(Path.home())
config_path = Path(Path.home(), '.globus', 'config_testing.ini')

config = configparser.ConfigParser()
config.read(str(config_path))

CLIENT_ID = config['sdk']['id']

source = 'Weymouth Mac Desktop'
source_dir = '/Volumes/Data2/GlobusEndpoint/transfer'
file = "test1.txt"
dest = "Weymouth Mac Laptop"
dest_dir = '/Users/weymouth/GlobusEndpoint/transfer'

client = globus_sdk.NativeAppAuthClient(CLIENT_ID)
client.oauth2_start_flow(refresh_tokens=True)

authorize_url = client.oauth2_get_authorize_url()

print(authorize_url)

auth_code = input('Please enter the code you get after login here: ').strip()
token_response = client.oauth2_exchange_code_for_tokens(auth_code)

print(str(token_response.by_resource_server))

globus_auth_data = token_response.by_resource_server['auth.globus.org']
globus_transfer_data = token_response.by_resource_server['transfer.api.globus.org']

# most specifically, you want these tokens as strings
AUTH_TOKEN = globus_auth_data['access_token']
TRANSFER_TOKEN = globus_transfer_data['access_token']

# a GlobusAuthorizer is an auxiliary object we use to wrap the token. In
# more advanced scenarios, other types of GlobusAuthorizers give us
# expressive power
authorizer = globus_sdk.AccessTokenAuthorizer(TRANSFER_TOKEN)

# and try using `tc` to make TransferClient calls. Everything should just
# work -- for days and days, months and months, even years
tc = globus_sdk.TransferClient(authorizer=authorizer)

print("My Endpoints:")
source_ep = None
dest_ep = None
for ep in tc.endpoint_search(filter_scope="my-endpoints"):
    if ep["display_name"] == source:
        source_ep = ep
    if ep["display_name"] == dest:
        dest_ep = ep

if source_ep:
    print("source ep = [{}] {}".format(source_ep["id"], source_ep["display_name"]))
else:
    print("No source ep")

if dest_ep:
    print("dest ep = [{}] {}".format(dest_ep["id"], dest_ep["display_name"]))
else:
    print("No dest ep")

if not source_ep or not dest_ep:
    exit(-1)

print("at source...")
source_dir = None
for entry in tc.operation_ls(source_ep['id'], path=source_dir):
    if entry['name'] == "transfer":
        source_dir = entry
    print("source entry: name = {}, type = {}".format(entry["name"], entry["type"]))

print("at dest...")
dest_dir = None
for entry in tc.operation_ls(dest_ep['id'], path=dest_dir):
    if entry['name'] == "transfer":
        dest_dir = entry
    print("dest entry: name = {}, type = {}".format(entry["name"], entry["type"]))

if source_dir:
    print(source_dir)
else:
    print("No source dir")

if dest_dir:
    print(dest_dir)
else:
    print("No dest dir")

tdata = globus_sdk.TransferData(
    tc, source_ep['id'], dest_ep['id'], label="SDK example", sync_level="checksum")
tdata.add_item(source_dir, dest_dir, recursive=True)
transfer_result = tc.submit_transfer(tdata)

print("task_id =", transfer_result["task_id"])

while not tc.task_wait(transfer_result["task_id"], timeout=1):
    print(".",)
print("\n{0} completed!".format(transfer_result["task_id"]))

print("at source...")
for entry in tc.operation_ls(source_ep['id']):
    print("source entry: name = {}, type = {}".format(entry["name"], entry["type"]))

print("at dest...")
for entry in tc.operation_ls(dest_ep['id']):
    print("dest entry: name = {}, type = {}".format(entry["name"], entry["type"]))
