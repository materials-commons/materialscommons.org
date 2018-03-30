class MCProcessDetailsRoComponentController {
    /*@ngInject*/
    constructor() {
    }

    $onChanges(changes) {
        if (!changes.process.isFirstChange()) {
            this.process = changes.process.currentValue;
        }
    }
}

angular.module('materialscommons').component('mcProcessDetailsRo', {
    template: require('./mc-process-details-ro.html'),
    controller: MCProcessDetailsRoComponentController,
    bindings: {
        process: '<'
    }
});
