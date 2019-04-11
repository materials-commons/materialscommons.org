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