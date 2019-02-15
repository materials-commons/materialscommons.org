class MCProcessesTableComponentController {
    /*@ngInject*/
    constructor(mcshow) {
        this.mcshow = mcshow;
        this.state = {
            sortOrder: 'name',
            processes: [],
        };
    }

    $onChanges(changes) {
        if (changes.processes) {
            this.state.processes = angular.copy(changes.processes.currentValue);
            this.state.processes.forEach(p => {
                p.files_count = p.files.length;
                p.input_samples_count = p.samples.filter(s => s.direction === 'in').length;
                p.output_samples_count = p.samples.filter(s => s.direction === 'out').length;
            });
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.processes);
    }
}

angular.module('materialscommons').component('mcProcessesTable', {
    controller: MCProcessesTableComponentController,
    template: require('./processes-table.html'),
    bindings: {
        processes: '<'
    }
});