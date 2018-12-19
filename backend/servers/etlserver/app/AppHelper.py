import logging
import os.path as os_path

from materials_commons.api import get_project_by_id

from ..internal_etl.BuildProjectExperimentWithETL import BuildProjectExperiment
from ..database.DatabaseInterface import DatabaseInterface

# used in "main" for interactive testing...
from random import randint
import time
from ..utils.LoggingHelper import LoggingHelper
from materials_commons.api import get_all_projects


class AppHelper:
    def __init__(self, apikey):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.apikey = apikey

    def get_project_excel_files(self, project_id):
        self.log.info("get_project_excel_files: project_id = {}".format(project_id))
        project = get_project_by_id(project_id, apikey=self.apikey)
        self.log.info("got project = {}".format(project.name))
        if not project:
            raise AttributeError("Project not found for projectId = {}".format(project_id))
        directory = project.get_top_directory()
        found_files = self.recursively_find_excel_files(directory, [], '/')
        self.log.info("found {} excel files".format(len(found_files)))
        return found_files

    def recursively_find_excel_files(self, directory, files_so_far, path):
        files_here = []
        children = directory.get_children()
        for child in children:
            if child.otype == 'directory':
                files_so_far = \
                    self.recursively_find_excel_files(
                        child, files_so_far, "{}{}/".format(path, child.name)
                    )
            else:
                if child.name.endswith(".xlsx"):
                    files_here = files_here + ["{}{}".format(path, child.name)]
        return files_so_far + files_here

    def run_project_based_etl(self, project_id, excel_file_path, name, desc):
        data_dir_path = os_path.dirname(excel_file_path)
        self.log.info("run_project_based_etl: project_id = {}".format(project_id))
        self.log.debug("  excel_file_path = {}".format(excel_file_path))
        self.log.debug("  data_dir_path = {}".format(data_dir_path))
        self.log.debug("  exp_name = {}".format(name))
        self.log.debug("  exp_desc = {}".format(desc))

        builder = BuildProjectExperiment(self.apikey)
        builder.build(excel_file_path, data_dir_path, project_id, name, desc)
        self.log.info("done")
        return {"status": "ok"}

    def run_excel_file_only_etl(self, project_id, external_file_path, name, desc):
        self.log.info("name = {}, description = {}".format(name, desc))
        internal_file = self.move_file_to_project(project_id, external_file_path)
        excel_file_path = "/" + internal_file.name
        self.log.info("excel_file_path = {}".format(excel_file_path))
        builder = BuildProjectExperiment(self.apikey)
        builder.build(excel_file_path, None, project_id, name, desc)
        self.log.info("done")
        return {"status": "ok"}

    def get_project_globus_upload_status(self, user_id, project_id):
        self.log.info("request for globus upload status: user = {}, project = {}"
                      .format(user_id, project_id))
        return_value = DatabaseInterface().get_status_records(user_id, project_id)
        for record in return_value:
            record["birthtime"] = self.convert_datetime(record["birthtime"])
            record["mtime"] = self.convert_datetime(record["mtime"])
        self.log.info("return_value = {}".format(return_value))
        return return_value

    def convert_datetime(self, in_dt):
        return in_dt.timestamp()

    def move_file_to_project(self, project_id, external_path):
        project = get_project_by_id(project_id, apikey=self.apikey)
        top_dir = project.get_top_directory()
        file_name = os_path.basename(external_path)
        self.log.info("external_path = {}, file_name = {}".format(external_path, file_name))
        file = top_dir.add_file(file_name, external_path)
        return file


# used in "main" for interactive testing
class AppHelperTester:
    def __init__(self, apikey, user_id):
        self.apikey = apikey
        self.user_id = user_id
        self.helper = AppHelper(apikey)

    @staticmethod
    def fake_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number

    def get_project_for_test(self, name):
        projects = get_all_projects(self.apikey)
        project = None
        for probe in projects:
            if probe.name == name:
                project = probe
        if not project:
            print("Can not find project {}".format(name))
            exit(-1)
        print("got project for test{}".format(project.name))
        return project

    def test_project_file_based_etl(self):
        print("test_project_file_based_etl")
        my_project = self.get_project_for_test("Test1")
        my_files = self.helper.get_project_excel_files(my_project.id)
        print("files: {}".format(my_files))
        excel_file_path = None
        file_name = "small_input.xlsx"
        for probe in my_files:
            if file_name in probe:
                excel_file_path = probe
        if not excel_file_path:
            print("missing excel file for test: {}".format(file_name))
            exit(-1)
        print("---------- running test: helper.run_project_based_etl ---------")
        name = self.fake_name("Exp-")
        desc = "Test Experiment: testing project-based ETL"
        results = self.helper.run_project_based_etl(my_project.id, excel_file_path, name, desc)
        print("---------- done running test ---------")
        print("Expected return results:")
        print(results)

    def test_get_project_globus_upload_status(self):
        print("test_get_project_globus_upload_status")
        my_project = self.get_project_for_test("Test1")
        return_value = {"status": None}
        print("Starting loop to wait for start...")
        while not return_value['status']:
            return_value = self.helper.get_project_globus_upload_status(self.user_id, my_project.id)
            print("Waiting for a globus request on project {}".format(my_project.name))
            time.sleep(5)
        print("Starting loop to wait for done...")
        while return_value['status']:
            print(return_value)
            time.sleep(5)
            return_value = self.helper.get_project_globus_upload_status(self.user_id, my_project.id)
        print("done")


if __name__ == "__main__":
    LoggingHelper().set_root()
    my_apikey = "totally-bogus"
    my_user_id = "test@test.mc"
    tester = AppHelperTester(my_apikey, my_user_id)
    # tester.test_project_file_based_etl()
    tester.test_get_project_globus_upload_status()
