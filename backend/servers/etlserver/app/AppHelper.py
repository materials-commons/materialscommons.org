from materials_commons.api import get_project_by_id, get_all_projects

class AppHelper:
    def __init__(self, apikey):
        # self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.apikey = apikey

    def get_project_excel_files(self, project_id):
        project = get_project_by_id(project_id)
        if not project:
            raise AttributeError("Project not found for projectId = {}".format(project_id))
        directory = project.get_top_directory()
        found_files = self.recursively_find_excel_files(directory, [], '/')
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

    def run_project_based_etl(self, project_id, excel_file_path, exp_name, exp_desc):
        return {"status": "ok"}

# if __name__ == "__main__":
#     main_log = logging.getLogger("Main")
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