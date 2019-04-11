class MCSamplesFilterComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            samples: [],
            uniqueProcesses: {},
            uniqueConditions: {},
        };
    }

    $onChanges(changes) {
        if (changes.samples) {
            this.state.samples = changes.samples.currentValue; // Never modified so just point at it
            this.state.samples.forEach(sample => {
                sample.processes.forEach(p => {
                    this.state.uniqueProcesses[p.name] = {name: p.name, selected: false};
                    p.setup.forEach(s => {
                        s.properties.forEach(c => {
                            this.state.uniqueConditions[c.name] = {name: c.name, value: ''};
                        });
                    });
                });
            });
        }
    }

    handleRunFilter() {
        let processes = {};
        let conditions = {};
        _.forEach(this.state.uniqueProcesses, (value, key) => {
            if (value.selected) {
                processes[key] = value;
            }
        });

        _.forEach(this.state.uniqueConditions, (value, key) => {
            if (value.value) {
                conditions[key] = value;
            }
        });

        this.onRunFilter({processes, conditions});
    }

    handleResetFilter() {
        this.onResetFilter();
    }
}

angular.module('materialscommons').component('mcSamplesFilter', {
    controller: MCSamplesFilterComponentController,
    template: require('./samples-filter.html'),
    bindings: {
        samples: '<',
        onRunFilter: '&',
        onResetFilter: '&',
    }
});