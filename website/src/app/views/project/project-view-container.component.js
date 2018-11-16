class MCProjectViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, mcRouteState, projectsAPI, modifyProjectShortcuts, $stateParams) {
        this.mcStateStore = mcStateStore;
        this.mcRouteState = mcRouteState;
        this.projectsAPI = projectsAPI;
        this.modifyProjectShortcuts = modifyProjectShortcuts;
        this.$stateParams = $stateParams;
        this.state = {
            project: mcStateStore.getState('project'),
        };
    }

    $onInit() {
        this.unsubscribe = this.mcStateStore.subscribe('project', p => this.state.project = angular.copy(p));
        this.unsubscribeSync = this.mcStateStore.subscribe('sync:project', () => this.handleSync());
    }

    $onDestroy() {
        this.unsubscribe();
        this.unsubscribeSync();
    }

    getRoute() {
        return this.mcRouteState.getRouteName();
    }

    handleSync() {
        this.projectsAPI.getProjectOverview(this.$stateParams.project_id).then(p => this.mcStateStore.updateState('project', p));
    }

    handleModifyShortcuts() {
        this.modifyProjectShortcuts.modifyShortcuts(this.state.project).then(() => this.handleSync());
    }
}

angular.module('materialscommons').component('mcProjectViewContainer', {
    template: require('./project-view-container.html'),
    controller: MCProjectViewContainerComponentController
});