/* global cytoscape:true */
class MCProcessesWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, workflowService, mcbus, experimentsService, $stateParams, mcstate, $filter, $mdDialog) {
        this.cy = null;
        this.processGraph = processGraph;
        this.workflowService = workflowService;
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.myName = 'MCProcessesWorkflowGraph';
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.experimentsService = experimentsService;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.removedNodes = null;
        this.navigator = null;
    }

    $onInit() {
        // To preserve this binding pass this.allProcessesGraph bound to an arrow function. Arrow
        // functions lexically scope, so this in the arrow function is the this for
        // MCProcessesWorkflowGraphComponentController
        let cb = (processes) => {
            this.processes = processes;
            this.allProcessesGraph();
        };

        this.mcbus.subscribe('PROCESSES$CHANGE', this.myName, cb);

        let searchcb = (search) => {
            if (search === '') {
                if (this.removedNodes !== null) {
                    this.removedNodes.restore();
                    this.cy.fit();
                }
                return;
            }
            this.removedNodes = null;
            let matches = this.$filter('filter')(this.processes.plain(), search);
            if (!matches.length) {
                return;
            }
            let matchesById = _.indexBy(matches, 'id');
            let matchingNodes = this.cy.nodes().filter((i, ele) => {
                let processId = ele.data('details').id;
                if ((processId in matchesById)) {
                    return false;
                }
                return true;
            });
            this.removedNodes = this.cy.remove(matchingNodes.union(matchingNodes.connectedEdges()));
            this.cy.fit();
        };

        this.mcstate.subscribe('WORKFLOW$SEARCH', this.myName, searchcb);
        this.mcbus.subscribe('WORKFLOW$RESET', this.myName, () => this.allProcessesGraph());
        this.mcbus.subscribe('WORKFLOW$NAVIGATOR', this.myName, () => {
            if (this.navigator === null) {
                this.navigator = this.cy.navigator();
            } else {
                this.navigator.destroy();
                this.navigator = null;
            }
        });

        this.mcbus.subscribe('WORKFLOW$FILTER$BYSAMPLES', this.myName, (samples) => {
            console.log('WORKFLOW$FILTER$BYSAMPLES', samples);
            if (!samples.length) {
                return;
            }

            let matchingProcesses = [];
            samples.forEach( sample => {
                let matches = this.$filter('filter')(this.processes.plain(), sample.id);
                matchingProcesses = matchingProcesses.concat(matches.map(p => ({id: p.id, seen: false})));
            });

            console.log('  number of matching processes', matchingProcesses.length);

            let matchesById = _.indexBy(matchingProcesses, 'id');
            let matchingNodes = this.cy.nodes().filter((i, ele) => {
                    let processId = ele.data('details').id;
                    if ((processId in matchesById)) {
                        return false;
                    }
                    return true;
            });
            this.removedNodes = this.cy.remove(matchingNodes.union(matchingNodes.connectedEdges()));
            this.cy.layout({name: 'dagre', fit: true});
        });
    }

    $onDestroy() {
        this.mcbus.leave('PROCESSES$CHANGE', this.myName);
        this.mcstate.leave('WORKFLOW$SEARCH', this.myName);
        this.mcbus.leave('WORKFLOW$RESET', this.myName);
        if (this.navigator !== null) {
            this.navigator.destroy();
        }
    }

    // This method will be called implicitly when the component is loaded.
    $onChanges(changes) {
        if (changes.processes) {
            this.processes = changes.processes.currentValue;
        }
        if (changes.highlightProcesses) {
            this.highlightProcesses = changes.highlightProcesses.currentValue;
        }
        this.allProcessesGraph();
    }

    allProcessesGraph() {
        let g = this.processGraph.build(this.processes, this.highlightProcesses);
        this.samples = g.samples;
        this.cy = cytoscape({
            container: document.getElementById('processesGraph'),
            elements: g.elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'content': 'data(name)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': 'data(color)',
                        color: 'black',
                        'text-outline-color': 'data(color)',
                        'font-size': '18px',
                        'font-weight': 'bold',
                        'text-outline-width': '5px',
                        'text-outline-opacity': 1,
                        'border-width': '4px',
                        'border-color': 'data(highlight)',
                        shape: 'data(shape)',
                        width: '80px',
                        height: '80px'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 4,
                        'target-arrow-shape': 'triangle',
                        //'target-arrow-color': '#9dbaea',
                        'curve-style': 'bezier',
                        'content': 'data(name)',
                        'font-weight': 'bold',
                        'text-outline-color': '#555',
                        'text-outline-width': '3px',
                        'color': '#fff'
                    }
                },
                {
                    selector: 'node:selected',
                    style: {
                        'border-width': '8px',
                        'border-color': '#2196f3',
                        color: '#2196f3'
                    }
                },
                {
                    selector: 'edge:selected',
                    style: {
                        'background-color': '#2196f3',
                        'text-outline-color': '#2196f3'
                    }
                }
            ]
        });

        this.cy.on('click', event => {
            let target = event.cyTarget;
            if (!target.isNode && !target.isEdge) {
                this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
                this.mcProcessesWorkflow.setSelectedProcess(null);
            } else if (target.isNode()) {
                //let edges = target.connectedEdges();
                //edges.forEach((e) => console.log('source is ' + e.data('source')));
                //console.log(target.connectedEdges());
                let processId = target.data('id');
                let process = this.processes.filter((p) => p.id === processId)[0];
                this.mcstate.set(this.mcstate.SELECTED$PROCESS, process);
                this.mcProcessesWorkflow.setSelectedProcess(processId, (target.outgoers().length > 0));
            } else if (target.isEdge()) {
                this.mcstate.set(this.mcstate.SELECTED$PROCESS, null);
                this.mcProcessesWorkflow.setSelectedProcess(null);
            }
        });
        //this.cy.on('mouseover', function(event) {
        //    let target = event.cyTarget;
        //    if (target.data) {
        //        //log('target', target.data('name'));
        //    }
        //    // Need to install qtip or some other
        //    //target.qtip({
        //    //    content: target.data('name')
        //    //});
        //});
        this.cy.layout({name: 'dagre', fit: true});
        this.cy.panzoom();
        this.setupContextMenus()
    }

    setupContextMenus() {
        let options = {
            menuItems: [
                {
                    id: 'details',
                    title: 'Show Details',
                    selector: 'node, edge',
                    onClickFunction: (event) => this._showDetails(event)
                }
            ]
        };
        this.cy.contextMenus(options);
    }

    _showDetails(event) {
        let target = event.cyTarget;
        if (target.isNode()) {
            let processId = target.data('id');
            let process = this.processes.filter((p) => p.id === processId)[0];
            process.hasChildren = (target.outgoers().length > 0);
            this.$mdDialog.show({
                templateUrl: 'app/project/experiments/experiment/components/workflow/mc-process-details-dialog.html',
                controller: MCProcessDetailsDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    process: target.data('details')
                }
            });
        }
    }

}

class MCProcessDetailsDialogController {
    /*@ngInject*/
    constructor($mdDialog, workflowService, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.workflowService = workflowService;
    }

    done() {
        this.$mdDialog.hide();
    }

    deleteProcess() {
        this.workflowService.deleteNodeAndProcess(this.projectId, this.experimentId, this.process.id)
    }
}

angular.module('materialscommons').component('mcProcessesWorkflowGraph', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow-graph.html',
    controller: MCProcessesWorkflowGraphComponentController,
    bindings: {
        processes: '<',
        highlightProcesses: '<'
    },
    require: {
        mcProcessesWorkflow: '^mcProcessesWorkflow'
    }
});
