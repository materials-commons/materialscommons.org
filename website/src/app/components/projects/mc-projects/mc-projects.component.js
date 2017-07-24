class MCProjectsComponentController {
    /*@ngInject*/
    constructor($mdDialog, User, mcbus, ProjectModel, blockUI, demoProjectService, toast) {
        this.$mdDialog = $mdDialog;
        this.User = User;
        this.mcbus = mcbus;
        this.ProjectModel = ProjectModel;
        this.blockUI = blockUI;
        this.demoProjectService = demoProjectService;
        this.toast = toast;
        this.mcuser = User.attr();
        this.myProjects = [];
        this.joinedProjects = [];
    }

    $onInit() {
        this.getUserProjects();
        this.mcbus.subscribe('PROJECTS$REFRESH', 'MCProjectsComponentController', () => {
            this.getUserProjects();
        });
    }

    createNewProject() {
        this.$mdDialog.show({
            templateUrl: 'app/components/projects/mc-projects/create-project-dialog.html',
            controller: CreateNewProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        }).then(
            () => this.getUserProjects()
        );
    }

    getUserProjects() {
        this.ProjectModel.getProjectsForCurrentUser().then(
            (projects) => {
                this.myProjects = projects.filter(p => p.owner === this.mcuser.email);
                this.joinedProjects = projects.filter(p => p.owner !== this.mcuser.email);
            }
        );
    }

    buildDemoProject() {
        this.blockUI.start("Building demo project (this may take a few seconds)...");
        this.demoProjectService.buildDemoProject(this.mcuser.email).then(
            () => {
                this.mcuser.demo_installed = true;
                this.User.save();
                this.blockUI.stop();
                this.mcbus.send('PROJECTS$REFRESH');
            },
            (error) => {
                this.blockUI.stop();
                let message = `Status: ${error.status}; Message: ${error.data}`;
                this.toast.error(message, 'top right');
            }
        );
    }

    hideDemoProjectButton() {
        this.mcuser.demo_installed = true;
        this.User.save();
        this.User.updateDemoInstalled(true);
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

angular.module('materialscommons').component('mcProjects', {
    templateUrl: 'app/components/projects/mc-projects/mc-projects.html',
    controller: MCProjectsComponentController
});
