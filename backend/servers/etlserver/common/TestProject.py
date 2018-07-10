from random import randint

from materials_commons.api import create_project


class TestProject:
    def __init__(self):
        project_name = self.fake_name("TestProject-")
        project_description = "Generated test project - " + project_name
        self.project = create_project(project_name, project_description)

    def get_project(self):
        return self.project

    @classmethod
    def fake_name(cls, prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number

