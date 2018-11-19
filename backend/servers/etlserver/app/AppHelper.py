import logging
from random import randint

import os.path as os_path

from materials_commons.api import get_project_by_id
from ..internal_etl.BuildProjectExperimentWithETL import BuildProjectExperiment

# used in "main" for interactive testing...
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


def fake_name(prefix):
    number = "%05d" % randint(0, 99999)
    return prefix + number


# if __name__ == "__main__":
#     LoggingHelper().set_root()
#     my_apikey = "totally-bogus"
#     helper = AppHelper(my_apikey)
#     projects = get_all_projects(my_apikey)
#     my_project = None
#     for probe in projects:
#         if probe.name == "Test1":
#             my_project = probe
#     if not my_project:
#         print("Can not fine project Test1")
#         exit(-1)
#     my_files = helper.get_project_excel_files(my_project.id)
#     print("files: {}".format(my_files))
#     excel_file_path = None
#     file_name = "small_input.xlsx"
#     for probe in my_files:
#         if file_name in probe:
#             excel_file_path = probe
#     if not excel_file_path:
#         print("missing excel file for test: {}".format(file_name))
#         exit(-1)
#     name = fake_name("Exp-")
#     desc = "Test Experiment: testing project-based ETL"
#     results = helper.run_project_based_etl(my_project.id, excel_file_path, name, desc)
#     print(results)
