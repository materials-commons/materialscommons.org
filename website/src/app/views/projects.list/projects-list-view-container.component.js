class MCProjectsListViewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, projectsAPI, $mdDialog, User, blockUI, demoProjectService, toast, mcprojstore) {
        this.$stateParams = $stateParams;
        this.projectsAPI = projectsAPI;
        this.$mdDialog = $mdDialog;
        this.User = User;
        this.blockUI = blockUI;
        this.demoProjectService = demoProjectService;
        this.toast = toast;
        this.mcprojstore = mcprojstore;
        this.state = {
            user: this.User.attr(),
            projects: []
        };
    }

    $onInit() {
        this._getProjectsForUser();
    }

    _getProjectsForUser() {
        this.projectsAPI.getProjectsForUser().then(
            projects => {
                this.state.projects = angular.copy(projects);
                this.mcprojstore.ready().then(() => this.mcprojstore.addProjects(...this.state.projects));
            },
            () => {
                this.toast.error('Unable to retrieve your projects');
            }
        );
    }

    handleCreateProject() {
        this.$mdDialog.show({
            templateUrl: 'app/modals/create-project-dialog.html',
            controller: CreateNewProjectDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        }).then(
            () => this._getProjectsForUser()
        );
    }

    handleCreateDemoProject() {
        this.blockUI.start('Building demo project (this may take up to a minute)...');
        this.demoProjectService.buildDemoProject(this.state.user.email).then(
            () => {
                this.state.user.demo_installed = true;
                this.User.save();
                this.state.user = angular.copy(this.User.attr());
                this.blockUI.stop();
                this._getProjectsForUser();
            },
            (error) => {
                this.blockUI.stop();
                let message = `Status: ${error.status}; Message: ${error.data}`;
                this.toast.error(message, 'top right');
            }
        );
    }

    handleHideDemoProject() {
        this.state.user.demo_installed = true;
        this.User.save();
        this.state.user = angular.copy(this.User.attr());
    }

    handleSync() {
        this._getProjectsForUser();
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

angular.module('materialscommons').component('mcProjectsListViewContainer', {
    template: `<mc-projects-list-view projects="$ctrl.state.projects" user="$ctrl.state.user"
                                on-create-project="$ctrl.handleCreateProject()"
                                on-create-demo-project="$ctrl.handleCreateDemoProject()"
                                on-hide-demo-project="$ctrl.handleHideDemoProject()"
                                on-sync="$ctrl.handleSync()" class="height-100" layout="column"></mc-projects-list-view>`,
    controller: MCProjectsListViewContainerComponentController
});