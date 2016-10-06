class MCUserSettingsProjectsComponentController {
    /*@ngInject*/
    constructor(User, projectsService, toast) {
        this.User = User;
        this.projectsService = projectsService;
        this.projects = [];
        this.defaultProject = "";
        this.defaultExperiment = "";
        this.toast = toast;
    }

    $onInit() {
        this.projectsService.getAllProjects().then(
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

angular.module('materialscommons').component('mcUserSettingsProjects', {
    templateUrl: 'app/user/components/mc-user-settings-projects.html',
    controller: MCUserSettingsProjectsComponentController
});
