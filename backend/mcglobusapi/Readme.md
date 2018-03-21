Notes on setup for dev
======================

Python setup
------------

Using python 2.7.
pip install -r requirements.txt
(also the setup of materials commons)

Globus setup
------------
### Endpoints
You will need two endpoints for testing and related development. 
1. The 'materials commons target' endpoint - this is the endpoint that is the 'goes to'
    side of upload and is generally hidden from the user; the user may see shared
    endpoints/path combinations built in this endpoint's context but never the entire content.
    In most dev and testing contexts this will be a personal globus endpoint in the
    materials commons context; it has to be running on the same host as materials commons.
2. The user's endpoint - generally a shared endpoint on a personal globus endpoint server.
    It can be running anywhere.
    
The UUID of the materials commons target endpoint (e.g. 1, above) must be availabe as a parameter
for the materials commons globus interface. Currently, this is stored in this configuration file:
`~/.globus/mc_config.ini` and is in a context group 'mc_client' with the configuration name 'ep_id'.
See *Globus setup - configuration*, below. When tests are run, this endpoint is assumed to be available.

The UUID of the user's endpoint, generally, will be used as an argument to the upload/download
(transfer) api. For running testing code, currently, it is stored in
`~/.globus_test/endpoint.ini` and, when tests are run it is assume to be available.

### Confidential Client

The Materials Commons Globus API uses a
[Globus Confidential Client](https://docs.globus.org/api/auth/reference/#client_credentials_grant)
which permits/supports a 'user name' and 'password' type of login. In order to run the
API you must set up such a client and obtain the user handle and the password token.
These are placed in an configuration file described in the next section.

### Configuration Files
Note: these are the current location of these values. Locations may change. For example,
might be moved to environment variables at some time.

These config files are read and parsed by the Python `configparser` 
[package](https://docs.python.org/2/library/configparser.html).
They are in a
standard *.ini format, using a context specification, for example the configuration file lines
```ini
[testing]
endpoint1=97797ef3-e57e-4848-8ee7-809592ab6c51
endpoint2=a6c1c77d-066f-4c9f-9be6-ba156706fa09
```

would define two endpoint UUID's in the 'testing' context. In code those endpoint values
would be assigned with
```python
import configparser
config = configparser.ConfigParser()
config.read("location/of/config/file.ini")
ep1 = config['testing']['endpoint1']
ep2 = config['testing']['endpoint2']
```
#### ...for MC Globus API
There is one config file required for running the Materials Commons Globus API which defines the
Confidential Client's parameters and the Materials Commons endpoint used to stage files uploaded from
the user. That endpoint with be the target endpoint of the users transfer (see section "How it works", below).
Currently this configuration file
is assumed to be located at `~/.globus/mn_client_config.ini` and to have the content
```ini
token=ALKA89A435NOADSF908-DA(*&%#UHKAD988UQORHA983
user=97797ef3-e57e-4848-8ee7-809592ab6c51
ep_id=a6c1c77d-066f-4c9f-9be6-ba156706fa09
```
Where 'token' is the password token for the Confidential Client and 'user' is the user UUID, user handle,
for the Confidential Client. The value 'ep_id' is the UUID of the Globus Endpoint for the target side of uploads
and the source side of downloads, to and from Materials Commons. Note that further shared endpoints can not
be made on this endpoint by the Confidential Client. Rather, sub directories or the endpoints root directory are
(dynamically) created and permitted to the user. 


#### ... for Testing
An additional configuration file is used for testing. Is is located at `~/.globus_test/endpoint.ini` and contains
```ini
[test]
endpoint=b626e88c-2873-11e8-b7c4-0ac6873fc732
directory=/test_upload_dir/sub_directory_b/
files=B1.txt:B2.txt:fractal.jpg
```
Where 'endpoint' is the simulated user endpoint (usually a shared endpoint on the users Globus Personal Endpoint),
'directory' is the directory in that shared endpoint for the files that should be upload, and 'files' are the files 
to be used in the transfer test. 

How it works
------------

### Upload
Intending to use Globus for upload the user obtains or creates a Globus Endpoint, for example a shared endpoint on 
a Globus Personal Endpoint; the user permits that endpoint (read for upload; read/write for download)
to the Materials Commons Confidential Client "user". The Confidential Client "user" can be searched for by name.

At the Materials Commons web interface, in the process of requesting an upload via Globus, the user supplies the UUID
of the endpoint from which Materials Commons should upload the files. The user also indicates
which files on which path within the endpoint are to be be upload (this, eventually, can be
done interactively). The user also indicates which project and what path within the project is the intended
location of the uploaded files. Then the user request the upload.

The Materials Commons server "stages" the upload by requesting a Globus Transfer task (on behalf of the user).
The transfer is between the users's endpoint/path/file-list and an endpoint/path internal to the Materials Commons
Confidential Client. The Globus API returns a task_id for the, pending, transfer.
In order to support, track, and eventually transform the files uploaded into internal format, the
Materials Commons server creates a special directory specifically for the transfer. The directory name uses the
id of the record of the users request so that request and data can be linked. In that record are stored the users id,
the project id, the path within the project, the globus task id, the transfer directory path, and a unique name for
the record.

The Materials Commons UI tells the user that the transfer has been initiated.

At some later time, the Materials Commons backend discovers, using the Globus task_id, that the upload task is
finished (or unacceptably stale) and if notes that status in the MC transfer record. If the upload was successful,
the Materials Commons backend initiates a transformation of the uploaded file to Materials Commons format/location.
Once that transformation is finished, the transfer record is marked completed.

In the mean time, the user will have received an e-mail notification from Globus that (the globus part of) the transfer
is complete and returning to the Materials Commons UI will see that the transformation is in progress (or completed).
If the transformation is still in progress, the used may elect to be notified by e-mail when it is finished.

Once the internal transformation is complete, the UI reflects the finished status and the uploaded files
(or the error state of any incomplete transfer/transformation).

### Download
Intending to use Globus for upload the user obtains or creates a Globus Endpoint, for example a shared endpoint on 
a Globus Personal Endpoint; the user permits that endpoint (read for upload; read/write for download)
to the Materials Commons Confidential Client "user". The Confidential Client "user" can be searched for by name.

At the Materials Commons web interface, in the process of requesting an down via Globus, the user supplies the UUID
of the endpoint from which Materials Commons should download the files. The user also indicates
which files on which path within a project are to be be downloaded (this, eventually, can be
done interactively). The user also indicates which path within the endpoint is the intended
location of the downloaded files. Then the user request the download.

The Materials Commons server initiates the download: the ntent and status of the download are recorded, 
a background process is launched, and the user is told that this has been done.

The background process creates an internal endpoint that is a list of links to the files for transfer. And then
initiates a Globus transfer of that content to the users endpoint/path.

The user received an e-mail (from Globus) that the transfer is complete.

The user can return to the Materials Commons UI and see transfer status (in progress, success, falure) at any time.

