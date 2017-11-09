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
    templateUrl: 'app/components/process/mc-process-details-ro/mc-process-details-ro.html',
    controller: MCProcessDetailsRoComponentController,
    bindings: {
        process: '<'
    }
});
