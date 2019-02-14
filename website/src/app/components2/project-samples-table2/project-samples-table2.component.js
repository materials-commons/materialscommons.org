class MCProjectSamplesTable2ComponentController {
    constructor() {
        this.state = {
            samples: [],
            sortOrder: 'name'
        };
    }

    $onChanges(changes) {
        if (changes.samples) {
            this.state.samples = angular.copy(changes.samples.currentValue);
            this.state.samples.forEach(s => {
                s.experiments_text = s.experiments.map(e => e.name).join(', ');
            });
        }
    }
}

angular.module('materialscommons').component('mcProjectSamplesTable2', {
    controller: MCProjectSamplesTable2ComponentController,
    template: require('./project-samples-table2.html'),
    bindings: {
        samples: '<',
    }
});