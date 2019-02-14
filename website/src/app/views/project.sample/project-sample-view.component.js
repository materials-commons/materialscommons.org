class MCProjectSampleViewComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.state = {
            sample: null,
        };
    }

    $onChanges(changes) {
        if (changes.sample) {
            this.state.sample = angular.copy(changes.sample.currentValue);
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.sample);
    }
}

angular.module('materialscommons').component('mcProjectSampleView', {
    controller: MCProjectSampleViewComponentController,
    template: require('./project-sample-view.html'),
    bindings: {
        sample: '<'
    }
});