class MCProjectsComponentController {
    /*@ngInject*/
    constructor($mdDialog, User, blockUI, demoProjectService, toast, mcprojstore, ProjectModel, $timeout) {
        this.$mdDialog = $mdDialog;
        this.User = User;
        this.blockUI = blockUI;
        this.demoProjectService = demoProjectService;
        this.toast = toast;
        this.mcuser = User.attr();
        this.mcprojstore = mcprojstore;
        this.ProjectModel = ProjectModel;
        this.myProjects = [];
        this.joinedProjects = [];
        this.$timeout = $timeout;
    }

    $onInit() {
        this.getUserProjects();
        this.unsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROJECT, this.mcprojstore.EVADD,
            projects => {
                this.$timeout(() => this._fillProjects(_.values(projects)));
            }
        );
    }

    $onDestroy() {
        this.unsubscribe();
    }

    createNewProject() {
        this.$mdDialog.show({
            templateUrl: 'app/components/projects/mc-projects/create-project-dialog.html',
            controller: CreateNewProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        }).then(
            (p) => this.mcprojstore.addProject(p)
        );
    }

    getUserProjects() {
        let projects = this.mcprojstore.projects;
        this._fillProjects(projects);
    }

    _fillProjects(projects) {
        this.myProjects = projects.filter(p => p.owner === this.mcuser.email);
        this.joinedProjects = projects.filter(p => p.owner !== this.mcuser.email);
    }

    buildDemoProject() {
        this.blockUI.start("Building demo project (this may take up to a minute)...");
        this.demoProjectService.buildDemoProject(this.mcuser.email).then(
            (p) => {
                this.mcuser.demo_installed = true;
                this.User.save();
                this.mcprojstore.addProject(p);
                this.blockUI.stop();
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

    refreshProjects() {
        this.mcprojstore.reset().then(
            () => {
                this.ProjectModel.getProjectsForCurrentUser().then(
                    (projects) => {
                        this.mcprojstore.addProjects(...projects);
                    }
                );
            }
        )
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
                    (p) => this.$mdDialog.hide(p),
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
