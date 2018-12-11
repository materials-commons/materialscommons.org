class MCWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, cyGraph) {
        this.processGraph = processGraph;
        this.cyGraph = cyGraph;
        this.state = {
            processes: [],
            samples: [],
            cy: null,
        };
    }

    $onChanges(changes) {
        if (changes.processes) {
            this.state.processes = angular.copy(changes.processes.currentValue);
            this.drawWorkflow();
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
                this.onSetCurrentProcess({process: process});
            }
        });
    }
}

angular.module('materialscommons').component('mcWorkflowGraph', {
    controller: MCWorkflowGraphComponentController,
    template: require('./workflow-graph.html'),
    bindings: {
        processes: '<',
        onSetCurrentProcess: '&'
    }
});