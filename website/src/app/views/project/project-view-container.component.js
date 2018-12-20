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
            experiment: null,
        };
    }

    $onInit() {
        this.unsubscribeProject = this.mcStateStore.subscribe('project', p => this.state.project = angular.copy(p));
        this.unsubscribeProjectSync = this.mcStateStore.subscribe('sync:project', () => this.handleProjectSync());
        this.unsubscribeExperiment = this.mcStateStore.subscribe('experiment', e => this.state.experiment = angular.copy(e));
    }

    $onDestroy() {
        this.unsubscribeProject();
        this.unsubscribeProjectSync();
        this.unsubscribeExperiment();
    }

    getRoute() {
        return this.mcRouteState.getRouteName();
    }

    handleProjectSync() {
        this.projectsAPI.getProjectOverview(this.$stateParams.project_id).then(p => this.mcStateStore.updateState('project', p));
    }

    handleModifyShortcuts() {
        this.modifyProjectShortcuts.modifyShortcuts(this.state.project).then(() => this.handleProjectSync());
    }
}

angular.module('materialscommons').component('mcProjectViewContainer', {
    template: require('./project-view-container.html'),
    controller: MCProjectViewContainerComponentController
});