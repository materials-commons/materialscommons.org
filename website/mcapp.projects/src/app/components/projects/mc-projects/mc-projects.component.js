angular.module('materialscommons').component('mcProjects', {
    templateUrl: 'app/components/projects/mc-projects/mc-projects.html',
    controller: MCProjectsComponentController
});

/*@ngInject*/
function MCProjectsComponentController($mdDialog, User, mcbus, ProjectModel) {
    const ctrl = this;
    ctrl.user = User.u();

    getUserProjects();

    mcbus.subscribe('PROJECTS$REFRESH', 'MCProjectsComponentController', () => {
        getUserProjects();
    });

    ctrl.createNewProject = () => {
        $mdDialog.show({
            templateUrl: 'app/components/projects/mc-projects/create-project-dialog.html',
            controller: CreateNewProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        }).then(
            () => getUserProjects()
        );
    };

    ///////////////////////

    function getUserProjects() {
        ProjectModel.getProjectsForCurrentUser().then(
            (projects) => {
                ctrl.myProjects = projects.filter(p => p.owner === ctrl.user);
                ctrl.joinedProjects = projects.filter(p => p.owner !== ctrl.user);
            }
        );
    }
}

class CreateNewProjectDialogController {
    /*@ngInject*/
    constructor($mdDialog, projectsAPI, toast) {
        this.$mdDialog = $mdDialog;
        this.name = '';
        this.description = '';
        this.projectsAPI = projectsAPI;
        this.toast = toast;
    }

    submit() {
        if (this.name !== '') {
            this.projectsAPI.createProject(this.name, this.description)
                .then(
                    () => this.$mdDialog.hide(),
                    () => this.toast.error('Unable to create project')
                );
        }
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}