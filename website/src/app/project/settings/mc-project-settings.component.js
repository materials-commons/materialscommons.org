class MCProjectSettingsComponentController {
    /*@ngInject*/

    /*@ngInject*/
    constructor(projectsAPI, projectSettingsService, mcprojstore, mcStateStore, toast, $mdDialog, $state, User) {
        this.projectsAPI = projectsAPI;
        this.projectSettingsService = projectSettingsService;
        this.mcprojstore = mcprojstore;
        this.mcStateStore = mcStateStore;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
        this.$state = $state;
        this.projectName = '';
        this.user = User.u();
    }

    $onInit() {
        this.project = this.mcStateStore.getState('project');
        this.projectName = this.project.name;
    }

    update() {
        let update = {
            name: this.projectName
        };
        this.projectsAPI.updateProject(this.project.id, update).then(
            () => {
                this.mcStateStore.fire('sync:project');
                this.$state.go('project.home');
            },
            () => this.toast.error('Unable to update project')
        );
    }

    deleteProject() {
        if (this.user !== this.project.owner) {
            this.toast.error('Only the owner of a project can delete the project.');
        } else {
            let deleteDialog = this.$mdDialog.confirm()
                .title(`Delete project: ${this.project.name}`)
                .textContent('Deleting a project is a permanent operation - all information with the project will be removed.')
                .ariaLabel('Delete Project')
                .ok('Delect Project')
                .cancel('cancel');

            this.$mdDialog.show(deleteDialog).then(
                () => {
                    this.projectsAPI.deleteProject(this.project.id).then(
                        () => this.mcprojstore.removeCurrentProject().then(() => this.$state.go('projects.list')),
                        () => this.toast.error('Failed to delete project')
                    );
                }
            );
        }
    }

    transferProjectOwner() {
        this.projectSettingsService.transferProjectOwner(this.project);
    }

    cancel() {
        this.$state.go('project.home');
    }
}

angular.module('materialscommons').component('mcProjectSettings', {
    template: require('./mc-project-settings.html'),
    controller: MCProjectSettingsComponentController
});