/*@ngInject*/
function ProjectModelService(projectsAPI) {
    class Project {
        constructor(id, name, owner) {
            this.id = id;
            this.name = name;
            this.owner = owner;
            this.samples_count = 0;
            this.processes_count = 0;
            this.experiments_count = 0;
            this.files_count = 0;
            this.description = "";
            this.birthtime = 0;
            this.owner_details = {};
            this.selected = false;
            this.selected2 = false;
            this.msg1 = "This is a status message";
            this.mtime = 0;
        }

        static fromJSON(data) {
            let p = new Project(data.id, data.name, data.owner);
            p.samples = data.samples;
            p.processes = data.processes;
            p.experiments = data.experiments;
            p.files_count = data.files;
            p.description = data.description;
            p.birthtime = new Date(data.birthtime * 1000);
            p.mtime = new Date(data.mtime * 1000);
            p.users = data.users;
            p.owner_details = data.owner_details;
            return p;
        }

        static get(id) {

        }

        static getProjectsForCurrentUser() {
            return projectsAPI.getAllProjects().then(
                (projects) => projects.map(p => Project.fromJSON(p))
            );
        }

        save() {

        }

        update() {

        }
    }

    return Project;
}

angular.module('materialscommons').factory('ProjectModel', ProjectModelService);
