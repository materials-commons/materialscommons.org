import MCStoreBus from './mcstorebus';

class StateStoreService {
    /*@ngInject*/
    constructor() {
        this.states = {};
        this.bus = new MCStoreBus();
    }

    updateState(key, value) {
        this.states[key] = angular.copy(value);
        let val = angular.copy(this.states[key]);
        this.bus.fireEvent(key, val);
    }

    getState(key) {
        if (_.has(this.states, key)) {
            return angular.copy(this.states[key]);
        }

        return null;
    }

    subscribe(state, fn) {
        return this.bus.subscribe(state, fn);
    }
}

angular.module('materialscommons').service('mcStateStore', StateStoreService);