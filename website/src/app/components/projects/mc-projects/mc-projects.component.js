class MCProjectsComponentController {
    /*@ngInject*/
    constructor($mdDialog, User, blockUI, demoProjectService, toast) {
        this.$mdDialog = $mdDialog;
        this.User = User;
        this.blockUI = blockUI;
        this.demoProjectService = demoProjectService;
        this.toast = toast;
        this.mcuser = User.attr();
        this.myProjects = [];
        this.joinedProjects = [];
    }

    $onChanges(changes) {
        if (changes.projects) {
            let projects = changes.projects.currentValue;
            this.myProjects = projects.filter(p => p.owner === this.mcuser.email);
            this.joinedProjects = projects.filter(p => p.owner !== this.mcuser.email);
        }
    }

    createNewProject() {
        this.$mdDialog.show({
            templateUrl: 'app/modals/create-project-dialog.html',
            controller: CreateNewProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
        }).then(
            (p) => this.mcprojstore.addProject(this.ProjectModel.fromJSON(p))
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
        this.blockUI.start('Building demo project (this may take up to a minute)...');
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
    template: require('./mc-projects.html'),
    controller: MCProjectsComponentController,
    bindings: {
        projects: '<'
    }
});
