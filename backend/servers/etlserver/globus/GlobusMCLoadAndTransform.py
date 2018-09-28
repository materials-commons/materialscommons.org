import os
import logging

from materials_commons.api import get_project_by_id


class GlobusMCLoadAndTransform:
    def __init__(self, project_id, apikey):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)
        self.log.info("init - started")
        self.project_id = project_id
        self.apikey = apikey
        self.log.info("init - done")

    def load_source_directory_into_project(self, transfer_base_path):
        project = get_project_by_id(self.project_id, apikey=self.apikey)

        self.log.info("working with project '{}' ({})".format(project.name, project.id))

        self.log.info("loading files and directories from = {}".format(transfer_base_path))
        current_directory = os.getcwd()
        os.chdir(transfer_base_path)
        directory = project.get_top_directory()

        file_count = 0
        dir_count = 0
        for f_or_d in os.listdir('.'):
            if os.path.isfile(f_or_d):
                file_count += 1
                directory.add_file(str(f_or_d), str(f_or_d))
            if os.path.isdir(f_or_d):
                dir_count += 1
                directory.add_directory_tree(str(f_or_d), '.')
        os.chdir(current_directory)

        self.log.info("Uploaded {} file(s) and {} dirs(s) to top level directory of project '{}'"
                      .format(file_count, dir_count, project.name))
