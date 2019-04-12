class MCProjectSamplesViewComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            samples: [],
            savedSamples: [],
            showFilter: false,
        };
    }

    $onChanges(changes) {
        if (changes.samples) {
            this.state.samples = angular.copy(changes.samples.currentValue);
        }
    }

    handleRunFilter(processes, conditions) {
        let processesCount = _.size(processes);
        let conditionsCount = _.size(conditions);
        let samplesMatchingProcesses = this.state.samples.filter(sample => {
            let matches = 0;
            sample.processes.forEach(p => {
                if (_.has(processes, p.name)) {
                    matches++;
                }
            });
            return matches === processesCount;
        });

        console.log(samplesMatchingProcesses.length);

        if (!processesCount) {
            samplesMatchingProcesses = this.state.samples;
        }

        let samplesMatchingConditions = samplesMatchingProcesses.filter(sample => {
            let matches = 0;
            sample.processes.forEach(p => {
                p.setup.forEach(s => {
                    s.properties.forEach(property => {
                        if (_.has(conditions, property.name)) {

                            // *** Don't use strict '===' here. We need javascript to convert values for comparison purposes. ***
                            if (/* Dont' change comparison to === */ property.value == conditions[property.name].value) {
                                matches++;
                            }
                        }
                    });
                });
            });
            return matches === conditionsCount;
        });

        this.state.savedSamples = this.state.samples;

        if (processesCount && conditionsCount) {
            this.state.samples = angular.copy(samplesMatchingConditions);
        } else if (processesCount) {
            this.state.samples = angular.copy(samplesMatchingProcesses);
        } else {
            this.state.samples = angular.copy(samplesMatchingConditions);
        }
    }

    handleResetFilter() {
        if (this.state.savedSamples.length) {
            this.state.samples = angular.copy(this.state.savedSamples);
        }
    }
}

angular.module('materialscommons').component('mcProjectSamplesView', {
    controller: MCProjectSamplesViewComponentController,
    template: require('./project-samples-view.html'),
    bindings: {
        samples: '<'
    }
});