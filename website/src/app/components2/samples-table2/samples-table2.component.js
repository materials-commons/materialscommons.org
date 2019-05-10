class MCSamplesTable2ComponentController {
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.state = {
            samples: [],
            sortOrder: 'name',
            origSamples: []
        };
    }

    $onChanges(changes) {
        if (changes.samples) {
            this.state.samples = angular.copy(changes.samples.currentValue);
            this.state.origSamples = changes.samples.currentValue;
            this.state.samples.forEach(s => {
                s.experiments_text = s.experiments.map(e => e.name).join(', ');
            });
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.origSamples);
    }
}

angular.module('materialscommons').component('mcSamplesTable2', {
    controller: MCSamplesTable2ComponentController,
    template: require('./samples-table2.html'),
    bindings: {
        samples: '<',
    }
});