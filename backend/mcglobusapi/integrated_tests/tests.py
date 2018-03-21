import unittest
import pytest
import os.path as os_path
from random import randint
import configparser

from globus_sdk import TransferAPIError

# pip install materials-commons
from materials_commons.api import create_project, Project, Directory

from .base_class_lib import ApiConnection, Remote
from ..globus_service import MaterialsCommonsGlobusInterface as GlobusInterface

# SETUP Constants
dir_in_project = "/upload_test"
user_endoint_config_file_path = os_path.join('.globus_test', 'endpoint.ini')
config_file_locaton_for_user_endpoint = os_path.join(os_path.expanduser("~"), user_endoint_config_file_path)


def fake_name(prefix):
    number = "%05d" % randint(0, 99999)
    return prefix + number


@pytest.mark.skip
class TestGlobusInterfaceSupport(unittest.TestCase):

    def test_db_api_connection(self):
        connection = ApiConnection()
        remote = Remote()
        test_url = remote.make_url('users')
        results = connection.get(test_url)
        self.assertIsNotNone(results)

    def test_db_api_test_users(self):
        connection = ApiConnection()
        remote = Remote()
        test_url = remote.make_url('users')
        results = connection.get(test_url)
        self.assertIsNotNone(results)
        self.assertEquals(type(results), list)
        self.assertEquals(len(results), 4, "Expecting test database with 4 users")
        missing = []
        all_test_users = ["admin@test.mc", "another@test.mc", "test@test.mc", "tadmin@test.mc"]
        users = []
        for user in results:
            users.append(user['id'])
        for probe in all_test_users:
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

    def test_that_materials_commons_globus_api_is_running(self):
        connection = ApiConnection()
        remote = Remote()
        url = remote.make_url('globus/')
        results = connection.get(url)
        self.assertIsNotNone(results)
        self.assertTrue("hello" in results)
        self.assertEqual(results['hello'], 'world')

    def test_that_local_and_remote_code_are_same_version(self):
        mc_user_id = "test@test.mc"
        globus_interface = GlobusInterface(mc_user_id)
        local_version = globus_interface.version

        connection = ApiConnection()
        remote = Remote()
        url = remote.make_url('globus/version')
        results = connection.get(url)
        remote_version = results['version']
        self.assertEqual(local_version, remote_version, "Service may not be running the code being tested")

    def test_version_via_globus_interface(self):
        mc_user_id = "test@test.mc"
        connection = ApiConnection()
        remote = Remote()
        partial_url = 'globus/version'
        test_url = remote.make_url(partial_url)
        results = connection.get(test_url)
        self.assertIsNotNone(results)
        self.assertIsNotNone(results["version"])
        self.assertEqual(results["version"], GlobusInterface(mc_user_id).version)

    def test_invalid_endpoint_raises_exception(self):
        mc_user_id = "test@test.mc"
        globus_interface = GlobusInterface(mc_user_id)
        self.assertIsNotNone(globus_interface)
        auth_client = globus_interface.get_auth_client()
        self.assertIsNotNone(auth_client, "Unable to obtain a authorization client from the Globus interface")
        transfer = globus_interface.get_transfer_interface(auth_client)
        self.assertIsNotNone(transfer, "Unable to obtain a transfer interface from the Globus interface")
        with pytest.raises(TransferAPIError):
            transfer.get_endpoint("invalid-endpoint-id")

    def test_that_materials_commons_endpoint_exists(self):
        mc_user_id = "test@test.mc"
        globus_interface = GlobusInterface(mc_user_id)
        self.assertIsNotNone(globus_interface)
        auth_client = globus_interface.get_auth_client()
        self.assertIsNotNone(auth_client, "Unable to obtain a authorization client from the Globus interface")
        transfer = globus_interface.get_transfer_interface(auth_client)
        self.assertIsNotNone(transfer, "Unable to obtain a transfer interface from the Globus interface")
        target_endpoint = transfer.get_endpoint(globus_interface.mc_target_ep_id)
        self.assertIsNotNone(target_endpoint)
        self.assertEqual(target_endpoint['id'], globus_interface.mc_target_ep_id)

    def test_create_project_object(self):
        name = fake_name("TestProject-")
        description = "Test project generated by automated test"
        project = create_project(name, description)
        self.assertIsNotNone(project.name)
        self.assertTrue(isinstance(project, Project))
        self.assertIsNotNone(project.description)
        self.assertIsNotNone(project.id)
        self.assertNotEqual(project.name, "")
        self.assertEqual(name, project.name)
        self.assertEqual(description, project.description)

    def test_target_project_directory(self):
        name = fake_name("TestProject-")
        description = "Test project generated by automated test"
        project = create_project(name, description)
        self.assertEqual(name, project.name)
        top_directory = project.get_top_directory()
        self.assertIsNotNone(top_directory)
        self.assertTrue(isinstance(top_directory, Directory))
        directory = project.add_directory(dir_in_project)
        self.assertIsNotNone(directory)
        self.assertTrue(isinstance(directory, Directory))
        self.assertEqual(directory.name, project.name + dir_in_project)


# @pytest.mark.skip(reason="This test class requires that a Globus test endpoint be set up and available")
class TestGlobusInterfaceUpload(unittest.TestCase):
    # ---------------------------------------------------------------
    # See test setup notes on setting up test endpoint: Readme.md !!!
    # ---------------------------------------------------------------
    @pytest.mark.skip
    def test_that_user_supplied_test_endpoint_exists(self):
        test_endpoint_id = self._get_user_globus_endpoint_config()['id']
        self.assertIsNotNone(test_endpoint_id)
        mc_user_id = "test@test.mc"
        globus_interface = GlobusInterface(mc_user_id)
        transfer = globus_interface.get_transfer_interface(globus_interface.get_auth_client())
        self.assertIsNotNone(transfer, "Unable to obtain a transfer interface from the Globus interface")
        user_test_endpoint = transfer.get_endpoint(test_endpoint_id)
        self.assertIsNotNone(user_test_endpoint)
        self.assertEqual(user_test_endpoint['id'], test_endpoint_id)

    @pytest.mark.skip
    def test_user_supplied_path_on_user_endpoint_exists(self):
        config = self._get_user_globus_endpoint_config()
        test_endpoint_id = config['id']
        mc_user_id = "test@test.mc"
        globus_interface = GlobusInterface(mc_user_id)
        transfer = globus_interface.get_transfer_interface(globus_interface.get_auth_client())
        user_test_endpoint = transfer.get_endpoint(test_endpoint_id)
        self.assertIsNotNone(user_test_endpoint)
        self.assertEqual(user_test_endpoint['id'], test_endpoint_id)
        endpoint_path = config['dir']
        probe = endpoint_path.split('/')
        path_parts = [x for x in probe if x]
        path_so_far = "/"
        self._recursive_dir_match_assert(transfer, test_endpoint_id, path_parts, path_so_far)
        contents = transfer.operation_ls(test_endpoint_id, path=endpoint_path)
        names = [part['name'] for part in contents['DATA']]
        message = "Endpoint directory '" + endpoint_path + "' " \
            "does not contain expected file: "
        for proj_file in config['files']:
            msg = message + proj_file
            self.assertTrue(proj_file in names, msg)

    # @pytest.mark.skip
    def test_transfer_setup_via_web_service(self):
        name = fake_name("TestProject-")
        description = "Test project generated by automated test"
        project = create_project(name, description)
        self.assertEqual(name, project.name)
        top_directory = project.get_top_directory()
        self.assertIsNotNone(top_directory)
        self.assertTrue(isinstance(top_directory, Directory))
        directory = project.add_directory(dir_in_project)
        self.assertIsNotNone(directory)
        self.assertTrue(isinstance(directory, Directory))
        self.assertEqual(directory.name, project.name + dir_in_project)

        config = self._get_user_globus_endpoint_config()

        data = {
            "project_id": project.id,
            "project_directory_path": dir_in_project,
            "user_endpoint_id": config['id'],
            "user_endpoint_path": config['dir']
        }
        partial_url = 'globus/upload'

        connection = ApiConnection()
        remote = Remote()
        test_url = remote.make_url(partial_url)
        results = connection.post(test_url, data)
        self.assertIsNotNone(results)
        #        print(results)
        #        {u'submission_id': u'd91ef4d7-2cf8-11e8-b83b-0ac6873fc732',
        #         u'message': u'The transfer has been accepted and a task has been created and queued for execution',
        #         u'code': u'Accepted', u'task_id': u'd91ef4d6-2cf8-11e8-b83b-0ac6873fc732'}
        self.assertIsNotNone(results)
        field_in_results = ['submission_id', 'message', 'code', 'task_id']
        for f in field_in_results:
            self.assertTrue(f in results)
            self.assertIsNotNone(results[f])
        self.assertEqual(results['code'], "Accepted")

    # def test_new_test(self)
    #     self.assertIsNotNone(None, "Vas you dare, Charlie?")

    @staticmethod
    def _get_user_globus_endpoint_config():
        config = configparser.ConfigParser()
        config.read(str(config_file_locaton_for_user_endpoint))
        file_list = config["test"]["files"].split(":")
        return {
            "id": config['test']['endpoint'],
            "dir": config['test']['directory'],
            "files": file_list
        }

    def _recursive_dir_match_assert(self, transfer, test_endpoint_id, parts, path_so_far):
        if not parts:
            return
        path_header = parts[0]
        contents = transfer.operation_ls(test_endpoint_id, path=path_so_far)
        names = [part['name'] for part in contents['DATA']]
        message = "Endpoint directory '" + path_so_far + "' " \
                  "does not contain required sub directory '" + path_header + "'"
        self.assertTrue(path_header in names, message)
        path_so_far += path_header + "/"
        parts = parts[1:]
        self._recursive_dir_match_assert(transfer, test_endpoint_id, parts, path_so_far)
