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
        console.log('defaultProject set to', this.defaultProject.plain());
        return;
        this.User.updateDefaultProject(this.defaultProject.id, this.defaultExperiment.id)
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
