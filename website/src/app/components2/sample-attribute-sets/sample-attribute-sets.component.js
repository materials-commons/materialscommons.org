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

    setAttrBestMeasure(attr, m) {
        let currentValue = m.selected;
        attr.measurements.forEach(m => m.selected = false);
        m.selected = currentValue;
    }

    showMeasurements(attr) {
        this.onShowMeasurements({attr: attr});
    }
}

angular.module('materialscommons').component('mcSampleAttributeSets', {
    controller: MCSampleAttributeSetsComponentController,
    template: require('./sample-attribute-sets.html'),
    bindings: {
        attributeSets: '<',
        onShowMeasurements: '&'
    }
});