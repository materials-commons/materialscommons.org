class MCDatasetWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, cyGraph, mcbus, mcshow, publicDatasetsAPI) {
        this.processGraph = processGraph;
        this.cyGraph = cyGraph;
        this.mcbus = mcbus;
        this.mcshow = mcshow;
        this.publicDatasetsAPI = publicDatasetsAPI;

        this.myName = 'MCDatasetWorkflowGraphComponentController';
    }

    $onInit() {
        this.allProcessesGraph();
        this.mcbus.subscribe('WORKFLOW$NAVIGATOR', this.myName, () => {
            if (this.navigator) {
                this.navigator.destroy();
                this.navigator = null;
            } else {
                this.navigator = this.cy.navigator();
                this.navigator.resize();
            }
        });
    }


    allProcessesGraph() {
        let g = this.processGraph.build(this.dataset.processes);
        this.cy = this.cyGraph.createGraph(g.elements, 'datasetGraph');
        let menu = {
            menuItems: [
                {
                    id: 'details',
                    title: 'Show Details',
                    selector: 'node',
                    onClickFunction: (event) => this._showDetails(event)
                }
            ]
        };
        this.cy.contextMenus(menu);
    }

    _showDetails(event) {
        let target = event.cyTarget;
        if (target.isNode()) {
            let processId = target.data('id');
            this.publicDatasetsAPI.getDatasetProcess(this.dataset.id, processId).then(
                p => this.mcshow.processDetailsDialog(p, false).then(
                    updatedProcess => target.data('name', updatedProcess.name)
                )
            );
        }
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowGraph', {
    templateUrl: 'app/components/workflow/mc-dataset-workflow/mc-dataset-workflow-graph.html',
    controller: MCDatasetWorkflowGraphComponentController,
    bindings: {
        dataset: '<'
    }
});
