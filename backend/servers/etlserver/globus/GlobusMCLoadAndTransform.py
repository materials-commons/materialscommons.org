import os
import logging

from materials_commons.api import get_project_by_id

from ..database.DatabaseInterface import DatabaseInterface
from ..database.BackgroundProcess import BackgroundProcess
# noinspection PyProtectedMember
from ..user.apikeydb import _load_apikeys as init_api_keys, user_apikey


class GlobusMCLoadAndTransform:
    def __init__(self):
        self.log = logging.getLogger(__name__ + "." + self.__class__.__name__)

    def load_source_directory_into_project(self, status_record_id):
        self.log.info("starting load_source_directory_into_project")

        status_record = DatabaseInterface().update_status(status_record_id, BackgroundProcess.RUNNING)

        transfer_base_path = status_record['extras']['transfer_base_path']
        user_id = status_record['owner']
        init_api_keys()
        apikey = user_apikey(user_id)
        project_id = status_record['project_id']

        project = get_project_by_id(project_id, apikey=apikey)

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
