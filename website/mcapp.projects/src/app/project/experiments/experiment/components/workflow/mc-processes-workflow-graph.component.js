/* global cytoscape:true */
class MCProcessesWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, workflowService, mcbus, experimentsAPI, $stateParams, mcstate, $filter, $mdDialog, mcshow) {
        this.cy = null;
        this.processGraph = processGraph;
        this.workflowService = workflowService;
        this.mcbus = mcbus;
        this.mcstate = mcstate;
        this.myName = 'MCProcessesWorkflowGraph';
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.experimentsAPI = experimentsAPI;
        this.$filter = $filter;
        this.$mdDialog = $mdDialog;
        this.mcshow = mcshow;
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
                    this.cy.layout({name: 'dagre', fit: true});
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
            this.cy.layout({name: 'dagre', fit: true});
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
            if (!samples.length) {
                return;
            }

            let matchingProcesses = [];
            samples.forEach(sample => {
                let matches = this.$filter('filter')(this.processes.plain(), sample.id);
                matchingProcesses = matchingProcesses.concat(matches.map(p => ({id: p.id, seen: false})));
            });

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
        // Use this to show/hide certain menu items
        // this.cy.on('cxttap', event => {
        //     console.log('cxttap');
        //     let target = event.cyTarget;
        //     if (target.isNode()) {
        //         console.log(' -- target is node', target.data('name'));
        //     }
        // });


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
        this.ctxMenu = this.setupContextMenus()
    }

    setupContextMenus() {
        let options = {
            menuItems: [
                {
                    id: 'details',
                    title: 'Show Details',
                    selector: 'node, edge',
                    hasTrailingDivider: true,
                    onClickFunction: (event) => this._showDetails(event)
                }
                // ,
                // {
                //     id: 'clone-process',
                //     title: 'Clone Process',
                //     selector: 'node',
                //     onClickFunction: (event) => this._cloneProcess(event)
                // }
                // ,
                // {
                //     id: 'delete-process',
                //     title: 'Delete Process',
                //     selector: 'node',
                //     onClickFunction: (event) => this._deleteProcess(event)
                // }
            ]
        };
        this.cy.contextMenus(options);
    }

    _showDetails(event) {
        let target = event.cyTarget;
        if (target.isNode()) {
            let process = this.getProcessFromEvent(event);
            this.mcshow.processDetailsDialog(process, false);
        }
    }

    _cloneProcess(event) {
        let process = this.getProcessFromEvent(event);
        this.workflowService.cloneProcess(this.projectId, this.experimentId, process);
    }

    _deleteProcess() {

    }

    getProcessFromEvent(event) {
        let target = event.cyTarget;
        let processId = target.data('id');
        let process = this.processes.filter((p) => p.id === processId)[0];
        process.hasChildren = (target.outgoers().length > 0);
        return process;
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