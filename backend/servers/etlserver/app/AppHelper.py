import logging
import os.path as os_path

from materials_commons.api import get_project_by_id

from ..internal_etl.BuildProjectExperimentWithETL import BuildProjectExperiment
from ..database.DatabaseInterface import DatabaseInterface

# used in "main" for interactive testing...
# from random import randint
# import time
# from ..utils.LoggingHelper import LoggingHelper
# from materials_commons.api import get_all_projects


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

    def get_project_globus_upload_status(self, project_id):
        database = DatabaseInterface()
        globus_upload_records = list(database.get_globus_upload_records())
        found_upload_record = False
        for r in globus_upload_records:
            if r['project_id'] == project_id:
                found_upload_record = True
                break
        if found_upload_record:
            message = "Globus is still upload files - Check Globus UI for progress"
            self.log.info(message)
            return {"status": message}
        else:
            file_load_records = list(database.get_file_loads_records())
            found_file_load_record = False
            for r in file_load_records:
                if r['project_id'] == project_id:
                    found_file_load_record = True
                    break
            if found_file_load_record:
                message = "Materials Commons is still loading files - " \
                        + "Check back later - Wait for this activity to finish"
                return {"status": message}
        return {"status": None}

# used in "main" for interactive testing
# class AppHelperTester:
#     def __init__(self, apikey):
#         self.apikey = apikey
#         self.helper = AppHelper(apikey)
#
#     @staticmethod
#     def fake_name(prefix):
#         number = "%05d" % randint(0, 99999)
#         return prefix + number
#
#     def get_project_for_test(self, name):
#         projects = get_all_projects(self.apikey)
#         project = None
#         for probe in projects:
#             if probe.name == name:
#                 project = probe
#         if not project:
#             print("Can not find project {}".format(name))
#             exit(-1)
#         print("got project for test{}".format(project.name))
#         return project
#
#     def test_project_file_based_etl(self):
#         print("test_project_file_based_etl")
#         my_project = self.get_project_for_test("Test1")
#         my_files = self.helper.get_project_excel_files(my_project.id)
#         print("files: {}".format(my_files))
#         excel_file_path = None
#         file_name = "small_input.xlsx"
#         for probe in my_files:
#             if file_name in probe:
#                 excel_file_path = probe
#         if not excel_file_path:
#             print("missing excel file for test: {}".format(file_name))
#             exit(-1)
#         print("---------- running test: helper.run_project_based_etl ---------")
#         name = self.fake_name("Exp-")
#         desc = "Test Experiment: testing project-based ETL"
#         results = self.helper.run_project_based_etl(my_project.id, excel_file_path, name, desc)
#         print("---------- done running test ---------")
#         print("Expected return results:")
#         print(results)
#
#     def test_get_project_globus_upload_status(self):
#         print("test_get_project_globus_upload_status")
#         my_project = self.get_project_for_test("Test1")
#         return_value = {"status": None}
#         print("Starting loop to wait for start...")
#         while not return_value['status']:
#             return_value = self.helper.get_project_globus_upload_status(my_project.id)
#             print("Waiting for a globus request on project {}".format(my_project.name))
#             time.sleep(5)
#         print("Starting loop to wait for done...")
#         while return_value['status']:
#             print(return_value)
#             time.sleep(5)
#             return_value = self.helper.get_project_globus_upload_status(my_project.id)
#         print("done")
#
# if __name__ == "__main__":
#     LoggingHelper().set_root()
#     my_apikey = "totally-bogus"
#     tester = AppHelperTester(my_apikey)
#     # tester.test_project_file_based_etl()
#     tester.test_get_project_globus_upload_status()
