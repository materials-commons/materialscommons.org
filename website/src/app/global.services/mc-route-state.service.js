class MCRouteStateService {
    /*@ngInject*/
    constructor() {
        this.routeName = "";
        this.route = {
            state: null,
            params: null,
        };
    }

    setRouteName(routeName) {
        this.routeName = routeName;
    }

    getRouteName() {
        return this.routeName;
    }

    setRoute(state, params) {
        console.log('setting route to ', state, params);
        this.route.state = state;
        this.route.params = params;
    }

    getRoute() {
        return this.route;
    }
}

angular.module('materialscommons').service('mcRouteState', MCRouteStateService);