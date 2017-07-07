class MCDatasetWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, cyGraph) {
        this.processGraph = processGraph;
        this.cyGraph = cyGraph;
    }

    $onInit() {
        this.allProcessesGraph();
    }

    $onChange() {
        this.allProcessesGraph();
    }

    allProcessesGraph() {
        let g = this.processGraph.build(this.dataset.processes);
        this.cy = this.cyGraph.createGraph(g.elements, 'datasetGraph');
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowGraph', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow-graph.html',
    controller: MCDatasetWorkflowGraphComponentController,
    bindings: {
        dataset: '<'
    }
});
