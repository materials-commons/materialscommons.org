class MCRouteStateService {
    /*@ngInject*/
    constructor() {
        this.routeName = "";
    }

    setRouteName(routeName) {
        this.routeName = routeName;
    }

    getRouteName() {
        return this.routeName;
    }
}

angular.module('materialscommons').service('mcRouteState', MCRouteStateService);