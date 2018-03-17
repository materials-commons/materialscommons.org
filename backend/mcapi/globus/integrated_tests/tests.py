import unittest
import pytest
from .base_class_lib import ApiConnection, Remote
from ..globus_service import MaterialsCommonsGlobusInterface as GlobusInterface

dir_in_source = "/"
dir_in_project = "/upload_test"

# Also, get rid of join table, just put project id in upload table.

class TestGlobusInterface(unittest.TestCase):

    def test_db_connection(self):
        connection = ApiConnection()
        remote = Remote()
        test_url = remote.make_url('users')
        results = connection.get(test_url)
        self.assertIsNotNone(results)

    def test_db_test_users(self):
        connection = ApiConnection()
        remote = Remote()
        test_url = remote.make_url('users')
        results = connection.get(test_url)
        self.assertIsNotNone(results)
        self.assertEquals(type(results), list)
        self.assertEquals(len(results), 4, "Expecting test database with 4 users")
        missing = []
        all = ["admin@test.mc", "another@test.mc", "test@test.mc", "tadmin@test.mc"]
        users = []
        for user in results:
            users.append(user['id'])
        for probe in all:
            if probe not in users:
                missing.append(probe)
        self.assertEqual(len(missing), 0, "Some test users are missing: " + ". ".join(missing))

    def test_globus_auth_client(self):
        mc_user_id = "test@test.mc"
        globus = GlobusInterface(mc_user_id)
        self.assertIsNotNone(globus)
        client = globus.get_auth_client()
        self.assertIsNotNone(client, "Unable to obtain a authorization client from the Globus interface")

    def test_globus_transfer_interface(self):
        mc_user_id = "test@test.mc"
        globus = GlobusInterface(mc_user_id)
        self.assertIsNotNone(globus)
        auth_client = globus.get_auth_client()
        self.assertIsNotNone(auth_client, "Unable to obtain a authorization client from the Globus interface")
        transfer = globus.get_transfer_interface(auth_client)
        self.assertIsNotNone(transfer, "Unable to obtain a transfer interface from the Globus interface")

    def test_that_local_and_remote_code_are_same_varsion(self):
        mc_user_id = "test@test.mc"
        globus_interface = GlobusInterface(mc_user_id)
        local_version = globus_interface.version

        connection = ApiConnection()
        remote = Remote()
        url = remote.make_url('/mcglobus/version')
        results = connection.get(url)
        remote_version = results['version']
        self.assertEqual(local_version, remote_version, "Service may not be running the code being tested")

    # def
    #     self.assertIsNotNone(None, "Vas you dare, Charlie?")
