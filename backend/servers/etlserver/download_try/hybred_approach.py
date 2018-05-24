from backend.servers.etlserver.download_try.GlobusDownload import GlobusDownload
from backend.servers.etlserver.download_try.GlobusDownloadWithConfidentialClient \
    import GlobusDownloadWithConfidentialClient

file_list = []
user_name = ''

probe1 = GlobusDownload(file_list, user_name)
client1 = probe1.get_transfer_client()
auth1 = probe1.auth_client

print(client1)
print(auth1)

