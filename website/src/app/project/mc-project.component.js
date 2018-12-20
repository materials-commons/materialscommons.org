class MCProjectComponentController {
    /*@ngInject*/
    constructor(mcRouteState) {
        this.mcRouteState = mcRouteState;
    }

    getRoute() {
        return this.mcRouteState.getRouteName();
    }
}

angular.module('materialscommons').component('mcProject', {
    template: require('./mc-project.html'),
    controller: MCProjectComponentController
});
