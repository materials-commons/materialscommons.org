class MCWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, cyGraph) {
        this.processGraph = processGraph;
        this.cyGraph = cyGraph;
        this.state = {
            processes: [],
            samples: [],
            cy: null,
            currentProcess: null,
        };
    }

    $onChanges(changes) {
        if (changes.processes) {
            this.state.processes = angular.copy(changes.processes.currentValue);
            this.drawWorkflow();
        }

        if (changes.samplesAdded) {
            if (this.state.currentProcess) {
                this.addEdge(changes.samplesAdded.currentValue, this.state.currentProcess);
            }
        }
    }

    drawWorkflow() {
        let graph = this.processGraph.build(this.state.processes, []);
        this.state.samples = graph.samples;
        this.cy = this.cyGraph.createGraph(graph.elements, 'processesGraph');
        this.setupOnClick();
    }

    setupOnClick() {
        this.cy.on('click', event => {
            let target = event.cyTarget;
            if (target.isNode()) {
                let process = target.data('details');
                this.state.currentProcess = process;
                this.onSetCurrentProcess({process: process});
            }
        });
    }

    addEdge(samples, targetProcess) {
        samples.forEach(sample => {
            const sourceProcess = this.findSourceProcess(sample);
            const id = `${targetProcess.id}_${sourceProcess.id}`;
            const existingEdge = this.cy.getElementById(id);
            if (existingEdge.length) {
                this.processGraph.addSampleToEdge(existingEdge, sample);
            } else {
                let newEdge = this.processGraph.createEdge(sourceProcess.id, targetProcess.id, sample);
                this.cy.add([{group: 'edges', data: newEdge}]);
            }
        });
    }

    findSourceProcess(sample) {
        for (let process of this.state.processes) {
            if (process.output_samples) {
                for (let s of process.output_samples) {
                    if (s.id === sample.id && s.property_set_id === sample.property_set_id) {
                        return process;
                    }
                }
            }
        }

        return null;
    }
}

angular.module('materialscommons').component('mcWorkflowGraph', {
    controller: MCWorkflowGraphComponentController,
    template: require('./workflow-graph.html'),
    bindings: {
        processes: '<',
        samplesAdded: '<',
        onSetCurrentProcess: '&'
    }
});