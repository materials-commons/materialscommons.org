class MCProjectViewContainerComponentController {
    /*@ngInject*/
    constructor(mcStateStore, mcRouteState) {
        this.mcStateStore = mcStateStore;
        this.mcRouteState = mcRouteState;
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
}

angular.module('materialscommons').component('mcProjectViewContainer', {
    template: require('./project-view-container.html'),
    controller: MCProjectViewContainerComponentController
});