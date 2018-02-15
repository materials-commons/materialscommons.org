class MCProjectSettingsComponentController {
    /*@ngInject*/

    /*@ngInject*/
    constructor(projectsAPI, mcprojstore, toast, $mdDialog, $state) {
        this.projectsAPI = projectsAPI;
        this.mcprojstore = mcprojstore;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
        this.$state = $state;
        this.projectName = "";
    }

    $onInit() {
        this.project = this.mcprojstore.currentProject;
        this.projectName = this.project.name;
    }

    update() {
        let update = {
            name: this.projectName
        };
        this.projectsAPI.updateProject(this.project.id, update).then(
            () => {
                this.mcprojstore.updateCurrentProject(currentProj => {
                    currentProj.name = this.projectName;
                    return currentProj;
                }).then(
                    () => this.$state.go('project.home')
                );
            },
            () => this.toast.error('Unable to update project')
        );
    }

    deleteProject() {
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
                )
            }
        );
    }

    cancel() {
        this.$state.go('project.home');
    }
}

angular.module('materialscommons').component('mcProjectSettings', {
    template: require('./mc-project-settings.html'),
    controller: MCProjectSettingsComponentController
});