/*@ngInject*/
function ProjectModelService(projectsAPI) {
    class Project {
        constructor(id, name, owner) {
            this.otype = 'project';
            this.id = id;
            this.name = name;
            this.owner = owner;
            this.files_count = 0;
            this.description = "";
            this.overview = "";
            this.birthtime = 0;
            this.owner_details = {};
            this.selected = false;
            this.mtime = 0;
            this.processes = [];
            this.samples = [];
            this.experiments = [];
            this.reminders = [];
            this.users = [];
            this.owner_details = {fullname: ''};
            this.status = 'none';
            this.todos = [];
            this.notes = [];
            this.shortcuts = [];
        }

        static fromJSON(data) {
            let p = new Project(data.id, data.name, data.owner);
            p.samples = data.samples;
            p.processes = data.processes;
            p.experiments = data.experiments;
            p.files_count = data.files;
            p.description = data.description;
            p.overview = data.overview;
            p.birthtime = new Date(data.birthtime * 1000);
            p.mtime = new Date(data.mtime * 1000);
            p.users = data.users;
            p.owner_details = data.owner_details;
            p.reminders = data.reminders;
            p.status = data.status;
            p.todos = data.todos;
            p.shortcuts = data.root_dirs.filter(d => {
                if (d.name === `${p.name}/Literature`) {
                    return true;
                } else if (d.name === `${p.name}/Presentations`) {
                    return true;
                } else if (d.name === `${p.name}/Project Documents`) {
                    return true;
                } else {
                    return false;
                }
            }).map(d => {
                return {
                    name: d.name.replace(`${p.name}/`, ''),
                    id: d.id
                };
            });
            if (data.notes) {
                p.notes = data.notes;
            }
            return p;
        }

        static getProjectForCurrentUser(id) {
            return projectsAPI.getProject(id).then(
                (project) => Project.fromJSON(project)
            );
        }

        static getProjectsForCurrentUser() {
            return projectsAPI.getAllProjects().then(
                (projects) => projects.map(p => Project.fromJSON(p))
            );
        }

        save() {

        }

        update(attrs) {
            return projectsAPI.updateProject(this.id, attrs);
        }
    }

    return Project;
}

angular.module('materialscommons').factory('ProjectModel', ProjectModelService);
