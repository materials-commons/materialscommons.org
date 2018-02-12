class MCProjectDetailsComponentControler {
    /*@ngInject*/
    constructor(projectsAPI, mcprojstore, toast, $state) {
        this.projectsAPI = projectsAPI;
        this.mcprojstore = mcprojstore;
        this.toast = toast;
        this.$state = $state;
        this.projectName = "";
        this.projectDescription = "";
    }

    $onInit() {
        this.project = this.mcprojstore.currentProject;
        this.projectName = this.project.name;
        this.projectDescription = this.project.description;
    }

    update() {
        let update = {
            description: this.projectDescription,
            name: this.projectName
        };
        this.projectsAPI.updateProject(this.project.id, update).then(
            () => {
                this.mcprojstore.updateCurrentProject(currentProj => {
                    currentProj.description = this.projectDescription;
                    currentProj.name = this.projectName;
                    return currentProj;
                }).then(
                    () => this.$state.go('project.home')
                );
            },
            () => this.toast.error('Unable to update project')
        );
    }

    cancel() {
        this.$state.go('project.home');
    }
}

angular.module('materialscommons').component('mcProjectDetails', {
    template: require('./mc-project-details.html'),
    controller: MCProjectDetailsComponentControler
});