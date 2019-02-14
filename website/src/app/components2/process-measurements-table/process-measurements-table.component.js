class MCProcessMeasurementsTableComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            measurements: [],
        };
    }

    $onChanges(changes) {
        if (changes.measurements) {
            this.state.measurements = angular.copy(changes.measurements.currentValue);
        }
    }
}

angular.module('materialscommons').component('mcProcessMeasurementsTable', {
    controller: MCProcessMeasurementsTableComponentController,
    template: require('./process-measurements-table.html'),
    bindings: {
        measurements: '<'
    }
});