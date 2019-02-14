class MCProcessSetupTableComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            setup: []
        };
    }

    $onChanges(changes) {
        if (changes.setup) {
            this.state.setup = angular.copy(changes.setup.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcProcessSetupTable', {
    controller: MCProcessSetupTableComponentController,
    template: require('./process-setup-table.html'),
    bindings: {
        setup: '<'
    }
});