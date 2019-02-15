class MCSampleTimelineComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            sample: null,
        };
    }

    $onChanges(changes) {
        if (changes.sample) {
            this.state.sample = angular.copy(changes.sample.currentValue);
            this.buildTimeline();
        }
    }

    buildTimeline() {
        // Create a list of unique processes. Some processes will appear twice if the sample was both an
        // input and output. Here we show processes once by storing all processes in a map indexed by their
        // id. This means that each process will only appear once. Then we filter the list to keep the order
        // by only returning processes we find that have the same property_set_id (processes that have both an
        // input and output will be associated with a different property_set_id).
        let processes = _.indexBy(this.state.sample.processes, 'id');
        this.state.sample.processesInTimeline = this.state.sample.processes.filter(
            (p) => processes[p.id].property_set_id === p.property_set_id
        );
    }
}

angular.module('materialscommons').component('mcSampleTimeline', {
    controller: MCSampleTimelineComponentController,
    template: require('./sample-timeline.html'),
    bindings: {
        sample: '<'
    }
});