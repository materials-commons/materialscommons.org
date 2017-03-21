angular.module('materialscommons').component('mcProjects', {
    templateUrl: 'app/components/projects/mc-projects/mc-projects.html',
    controller: MCProjectsComponentController
});

/*@ngInject*/
function MCProjectsComponentController($mdDialog, User, mcbus, ProjectModel, blockUI, demoProjectService, toast) {
    const ctrl = this;
    ctrl.user = User.u();
    ctrl.demoInstalled = User.attr().demo_installed;

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

    ctrl.buildDemoProject = buildDemoProject;

    ///////////////////////

    function getUserProjects() {
        ProjectModel.getProjectsForCurrentUser().then(
            (projects) => {
                ctrl.myProjects = projects.filter(p => p.owner === ctrl.user);
                ctrl.joinedProjects = projects.filter(p => p.owner !== ctrl.user);
            }
        );
    }

    function buildDemoProject() {
        let user_id = ctrl.user;
        blockUI.start("Building demo project (this may take a few seconds)...");
        demoProjectService.buildDemoProject(user_id).then(
            () => {
                blockUI.stop();
                mcbus.send('PROJECTS$REFRESH');
            },
            (error) => {
                blockUI.stop();
                let message = `Status: ${error.status}; Message: ${error.data}`;
                toast.error(message, 'top right');
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