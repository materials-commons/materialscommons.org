from materials_commons.api import get_all_projects

project_list = get_all_projects()

for project in project_list:
    print(project.name)