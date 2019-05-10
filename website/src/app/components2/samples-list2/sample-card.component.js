class MCSampleCardComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            sample: null,
        };
    }

    $onChanges(changes) {
        if (changes.sample) {
            this.state.sample = angular.copy(changes.sample.currentValue);
            this.state.sample.conditions = [];
            this.state.sample.processes.forEach(p => {
                p.setup.forEach(s => {
                    s.properties.forEach(prop => {
                        prop.processName = p.name;
                        this.state.sample.conditions.push(prop);
                    });
                });
            });
        }
    }
}

angular.module('materialscommons').component('mcSampleCard', {
    controller: MCSampleCardComponentController,
    template: require('./sample-card.html'),
    bindings: {
        sample: '<',
    }
});