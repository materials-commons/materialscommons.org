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
            this.setBestMeasures();
        }
    }

    setBestMeasures() {
        this.state.attributeSets.forEach(as => {
            as.attributes.forEach(a => {
                if (a.best_measure !== 'None') {
                    a.measurements.forEach(m => {
                        if (m.id === a.best_measure.measurement_id) {
                            m.selected = true;
                        }
                    });
                }
            });
        });
    }

    setAttrBestMeasure(attr, m) {
        if (!m.selected) {
            this.onSetAsBestMeasure({attrId: attr.id, mId: ''});
        } else {
            this.onSetAsBestMeasure({attrId: attr.id, mId: m.id});
        }
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
        onAddAttribute: '&',
        onSetAsBestMeasure: '&',
    }
});