class MCSampleAttributeSetsComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
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
        this.onShowMeasurements({attr: attr});
    }

    handleAddAttribute() {
        // this.onAddAttribute({attrSet: attrSet});
        this.mcshow.addAttribute();
    }
}

angular.module('materialscommons').component('mcSampleAttributeSets', {
    controller: MCSampleAttributeSetsComponentController,
    template: require('./sample-attribute-sets.html'),
    bindings: {
        attributeSets: '<',
        onShowMeasurements: '&',
        onAddAttribute: '&',
    }
});