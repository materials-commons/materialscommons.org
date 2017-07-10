class MCDatasetWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, cyGraph, mcbus, mcstate, $filter, mcshow, publicDatasetsAPI) {
        this.processGraph = processGraph;
        this.cyGraph = cyGraph;
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.$filter = $filter;
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

        let searchcb = (search) => {
            if (search === '') {
                if (this.removedNodes !== null) {
                    this.removedNodes.restore();
                    this.cy.layout({name: 'dagre', fit: true});
                }
                return;
            }
            this.removedNodes = null;
            let matches = this.$filter('filter')(this.dataset.processes, search);
            if (!matches.length) {
                return;
            }
            let matchesById = _.indexBy(matches, 'id');
            let matchingNodes = this.cy.nodes().filter((i, ele) => {
                let processId = ele.data('details').id;
                return (!(processId in matchesById));

            });
            this.removedNodes = this.cy.remove(matchingNodes.union(matchingNodes.connectedEdges()));
            this.cy.layout({name: 'dagre', fit: true});
        };

        this.mcstate.subscribe('WORKFLOW$SEARCH', this.myName, searchcb);
    }

    $onDestroy() {
        this.mcstate.leave('WORKFLOW$SEARCH', this.myName);
        this.mcbus.leave('WORKFLOW$NAVIGATOR', this.myName);
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
                p => this.mcshow.processDetailsDialogRO(p, false)
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
