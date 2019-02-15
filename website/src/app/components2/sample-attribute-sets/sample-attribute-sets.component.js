class MCSampleAttributeSetsComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            attributeSets: []
        };
    }

    $onChanges(changes) {
        if (changes.attributeSets) {
            this.state.attributeSets = angular.copy(changes.attributeSets.currentValue);
        }
    }

    showMeasurements(attr) {
        console.log('show measurements for attr', attr);
    }
}

angular.module('materialscommons').component('mcSampleAttributeSets', {
    controller: MCSampleAttributeSetsComponentController,
    template: require('./sample-attribute-sets.html'),
    bindings: {
        attributeSets: '<'
    }
});