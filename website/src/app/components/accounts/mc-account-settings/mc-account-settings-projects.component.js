class MCAccountSettingsProjectsComponentController {
    /*@ngInject*/
    constructor(User, projectsAPI, toast) {
        this.User = User;
        this.projectsAPI = projectsAPI;
        this.projects = [];
        this.defaultProject = "";
        this.defaultExperiment = "";
        this.toast = toast;
    }

    $onInit() {
        this.projectsAPI.getAllProjects().then(
            (projects) => this.projects = projects,
            () => this.toast.error('Unable to retrieve users projects')
        );
    }

    updateDefaultProjectSettings() {
        let projectId = this.defaultProject.id ? this.defaultProject.id : "",
            experimentId = this.defaultExperiment.id ? this.defaultExperiment.id : "";

        if (projectId === "") {
            // No project selected
            return;
        }

        this.User.updateDefaultProject(projectId, experimentId)
            .then(
                () => null,
                () => this.toast.error('Unable to set default project/experiment')
            );
    }


}

angular.module('materialscommons').component('mcAccountSettingsProjects', {
    template: require('./mc-account-settings-projects.html'),
    controller: MCAccountSettingsProjectsComponentController
});
