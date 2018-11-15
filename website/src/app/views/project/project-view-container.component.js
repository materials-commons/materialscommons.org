class MCProjectViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, mcRouteState, projectsAPI, $stateParams) {
        this.mcStateStore = mcStateStore;
        this.mcRouteState = mcRouteState;
        this.projectsAPI = projectsAPI;
        this.$stateParams = $stateParams;
        this.state = {
            project: mcStateStore.getState('project'),
        };
    }

    $onInit() {
        this.unsubscribe = this.mcStateStore.subscribe('project', p => this.state.project = angular.copy(p));
    }

    $onDestroy() {
        this.unsubscribe();
    }

    getRoute() {
        return this.mcRouteState.getRouteName();
    }

    handleSync() {
        this.projectsAPI.getProjectOverview(this.$stateParams.project_id).then(p => this.mcStateStore.updateState('project', p));
    }
}

angular.module('materialscommons').component('mcProjectViewContainer', {
    template: require('./project-view-container.html'),
    controller: MCProjectViewContainerComponentController
});