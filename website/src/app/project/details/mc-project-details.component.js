class MCProjectDetailsComponentControler {
    /*@ngInject*/
    constructor(projectsAPI, toast, mcStateStore, $state) {
        this.projectsAPI = projectsAPI;
        this.toast = toast;
        this.mcStateStore = mcStateStore;
        this.$state = $state;
        this.projectDescription = "";
    }

    $onInit() {
        this.project = this.mcStateStore.getState('project');
        this.projectDescription = this.project.description;
    }

    update() {
        let update = {
            description: this.projectDescription,
        };
        this.projectsAPI.updateProject(this.project.id, update).then(
            () => {
                this.mcStateStore.fire('sync:project');
                this.$state.go('project.home');
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
    controller: MCProjectDetailsComponentControler,
    bindings: {
        project: '<',
    }
});