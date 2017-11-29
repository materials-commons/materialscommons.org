class MCDatasetWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, cyGraph, mcbus, mcstate, $filter, mcshow, publicDatasetsAPI, $stateParams, $timeout) {
        this.processGraph = processGraph;
        this.cyGraph = cyGraph;
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.$filter = $filter;
        this.mcshow = mcshow;
        this.publicDatasetsAPI = publicDatasetsAPI;
        this.$timeout = $timeout;
        this.datasetId = $stateParams.dataset_id;
        this.hiddenNodes = [];
        this.sidebarShowing = true;

        this.myName = 'MCDatasetWorkflowGraphComponentController';
    }

    $onInit() {
        this.mcstate.subscribe('WORKSPACE$MAXIMIZED', this.myName, (maximized) => {
            this.sidebarShowing = !maximized;
            this.$timeout(() => this.cy.fit(), 300);
        });

        this.mcbus.subscribe('WORKFLOW$NAVIGATOR', this.myName, () => {
            if (this.navigator) {
                this.navigator.destroy();
                this.navigator = null;
            } else {
                this.navigator = this.cy.navigator();
                this.navigator.resize();
            }
        });

        this.mcbus.subscribe('WORKFLOW$RESTOREHIDDEN', this.myName, () => {
            if (this.hiddenNodes.length) {
                this.hiddenNodes.restore();
                this.hiddenNodes = [];
                this.cy.layout({name: 'dagre', fit: true});
            }
        });

        this.mcbus.subscribe('WORKFLOW$RESET', this.myName, () => this.allProcessesGraph());

        this.mcbus.subscribe('WORKFLOW$HIDEOTHERS', this.myName, processes => {
            this._addToHidden(this.cyGraph.hideOtherNodesMultiple(this.cy, processes))
        });

        this.mcstate.subscribe('WORKFLOW$SEARCH', this.myName, (search) => {
            if (search === '') {
                if (this.removedNodes !== null) {
                    this.removedNodes.restore();
                    this.cy.layout({name: 'dagre', fit: true});
                }
                return;
            }
            this.removedNodes = this.cyGraph.searchProcessesInGraph(this.cy, search, this.dataset.processes);
        });

        this.mcbus.subscribe('WORKFLOW$FILTER$BYSAMPLES', this.myName, (samples) => {
            this.removedNodes = this.cyGraph.filterBySamples(this.cy, samples, this.dataset.processes);
        });

        this.$timeout(() => this.allProcessesGraph(), 500);
    }

    $onDestroy() {
        this.mcstate.leave('WORKFLOW$SEARCH', this.myName);
        this.mcbus.leave('WORKFLOW$NAVIGATOR', this.myName);
        this.mcstate.leave('WORKSPACE$MAXIMIZED', this.myName);
        this.mcbus.leave('WORKFLOW$RESTOREHIDDEN', this.myName);
        this.mcbus.leave('WORKFLOW$RESET', this.myName);
        this.mcbus.leave('WORKFLOW$FILTER$BYSAMPLES', this.myName);
        this.mcbus.leave('WORKFLOW$HIDEOTHERS', this.myName);
        if (this.navigator) {
            this.navigator.destroy();
        }
        this.cy.destroy();
    }

    allProcessesGraph() {
        let g = this.processGraph.build(this.dataset.processes);
        this.cy = this.cyGraph.createGraph(g.elements, 'datasetGraph');
        this.cyGraph.setOnClickForDataset(this.cy, this.datasetId);
        let menu = {
            menuItems: [
                {
                    id: 'details',
                    content: 'Show Details',
                    selector: 'node',
                    hasTrailingDivider: true,
                    onClickFunction: (event) => this._showDetails(event)
                },
                {
                    id: 'collapse',
                    content: 'Collapse',
                    selector: 'node',
                    onClickFunction: event => this.cyGraph.collapseNode(this.cy, event)
                },
                {
                    id: 'expand',
                    content: 'Expand',
                    selector: 'node',
                    onClickFunction: event => this.cyGraph.expandNode(event)
                },
                {
                    id: 'hide',
                    content: 'Hide',
                    selector: 'node',
                    onClickFunction: event => this._addToHidden(this.cyGraph.hideNode(this.cy, event))
                },
                {
                    id: 'hide-others',
                    content: 'Hide Others',
                    selector: 'node',
                    onClickFunction: event => this._addToHidden(this.cyGraph.hideOtherNodes(this.cy, event))
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

    _addToHidden(hidden) {
        if (this.hiddenNodes.length) {
            this.hiddenNodes = this.hiddenNodes.union(hidden);
        } else {
            this.hiddenNodes = hidden;
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
