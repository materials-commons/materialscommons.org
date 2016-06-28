class MCUserSettingsProjectsComponentController {
    /*@ngInject*/
    constructor(User, projectsService, toast) {
        this.User = User;
        this.projectsService = projectsService;
        this.projects = [];
        this.defaultProject = "";
        this.toast = toast;
    }

    $onInit() {
        this.projectsService.getAllProjects().then(
            (projects) => this.projects = projects,
            () => this.toast.error('Unable to retrieve users projects')
        );
    }

    updateDefaultProject() {
        console.log('defaultProject set to', this.defaultProject.plain());
    }
}

angular.module('materialscommons').component('mcUserSettingsProjects', {
    templateUrl: 'app/user/components/mc-user-settings-projects.html',
    controller: MCUserSettingsProjectsComponentController
});
