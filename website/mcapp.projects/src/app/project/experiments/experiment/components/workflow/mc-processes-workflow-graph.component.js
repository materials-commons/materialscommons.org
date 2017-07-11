function getRemovableChildren(node) {
    let nodes = node.successors().filter((i, ele) => {
        let eleNodes = ele.incomers().filter((i, ele) => ele.isNode());
        if (eleNodes.length === 1) {
            return true;
        } else {
            // Check if this node connects to target. If it does then it is connected
            // to multiple nodes at the same level as target and we cannot hide it.
            let hasTargetAsParent = false;
            eleNodes.forEach(e => {
                if (e.data('id') === node.data('id')) {
                    hasTargetAsParent = true;
                }

            });
            return !hasTargetAsParent;
        }
    });

    return nodes.union(nodes.connectedEdges());
}

class MCProcessesWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, workflowService, mcbus, experimentsAPI, $stateParams, mcstate, $filter,
                $mdDialog, mcshow, workflowState, cyGraph) {
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
        this.workflowState = workflowState;
        this.cyGraph = cyGraph;
        this.hiddenNodes = [];
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
        this.mcbus.subscribe('PROCESS$ADD', this.myName, (process) => {
            let node = this.processGraph.createProcessNode(process);
            this.cy.add(node);
            let edges = this.processGraph.createConnectingEdges(process, this.processes);
            console.log('edges', edges);
            if (edges.length) {
                this.cy.add(edges);
            }
            this.processes.push(process);
        });
        this.mcbus.subscribe('PROCESS$DELETE', this.myName, (process) => console.log('PROCESS$DELETE', process));
        this.mcbus.subscribe('EDGE$ADD', this.myName, (source, target) => console.log('EDGE$ADD', source, target));
        this.mcbus.subscribe('EDGE$DELETE', this.myName, (source, target) => console.log('EDGE$DELETE', source, target));

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
                return (!(processId in matchesById));

            });
            this.removedNodes = this.cy.remove(matchingNodes.union(matchingNodes.connectedEdges()));
            this.cy.layout({name: 'dagre', fit: true});
        };

        this.mcbus.subscribe('WORKFLOW$RESTOREHIDDEN', this.myName, () => {
            if (this.hiddenNodes.length) {
                this.hiddenNodes.restore();
                this.hiddenNodes = [];
            }
        });

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
                return (!(processId in matchesById));

            });
            this.removedNodes = this.cy.remove(matchingNodes.union(matchingNodes.connectedEdges()));
            this.cy.layout({name: 'dagre', fit: true});
        });
    }

    $onDestroy() {
        this.mcbus.leave('PROCESSES$CHANGE', this.myName);
        this.mcbus.leave('WORKFLOW$RESTOREHIDDEN', this.myName);
        this.mcstate.leave('WORKFLOW$SEARCH', this.myName);
        this.mcbus.leave('WORKFLOW$RESET', this.myName);
        this.mcbus.leave('PROCESS$ADD', this.myName);
        this.mcbus.leave('PROCESS$DELETE', this.myName);
        this.mcbus.leave('EDGE$ADD', this.myName);
        this.mcbus.leave('EDGE$DELETE', this.myName);
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
        this.cy = this.cyGraph.createGraph(g.elements, 'processesGraph');
        this.cyGraph.setOnClickForExperiment(this.cy, this.projectId, this.experimentId);

        this.ctxMenu = this.setupContextMenus();
        let completeFN = (source, target, addedEntities) => {
            let sourceProcess = source.data('details');
            let targetProcess = target.data('details');
            if (sourceProcess.output_samples.length === 1) {
                this.workflowService.addSamplesToProcess(this.projectId, this.experimentId, targetProcess, sourceProcess.output_samples).then(
                    (process) => {
                        this.replaceProcess(process);
                        target.data('details', process);
                    }
                );
            } else {
                this.workflowService.chooseSamplesFromSource(sourceProcess).then(
                    (samples) => {
                        if (!samples.length) {
                            // No samples brought over, delete edge
                            addedEntities[0].remove();
                        } else {
                            this.workflowService.addSamplesToProcess(this.projectId, this.experimentId, targetProcess, samples).then(
                                (process) => {
                                    this.replaceProcess(process);
                                    target.data('details', process);
                                }
                            );
                        }
                    }
                );
            }
        };
        this.cyGraph.addEdgeHandles(this.cy, completeFN);
    }

    replaceProcess(process) {
        let i = _.findIndex(this.processes, p => p.id === process.id);
        if (i !== -1) {
            this.processes.splice(i, 1);
            this.processes.push(process);
        }
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
                },
                {
                    id: 'clone-process',
                    title: 'Clone Process',
                    selector: 'node',
                    onClickFunction: (event) => this._cloneProcess(event)
                },
                {
                    id: 'add-child',
                    title: 'Add Child',
                    selector: 'node',
                    onClickFunction: (event) => this._addChild(event)
                },
                {
                    id: 'delete-process',
                    title: 'Delete Process',
                    selector: 'node',
                    hasTrailingDivider: true,
                    onClickFunction: (event) => this._deleteProcess(event)
                },
                {
                    id: 'collapse',
                    title: 'Collapse',
                    selector: 'node',
                    onClickFunction: event => this._collapseNode(event)
                },
                {
                    id: 'expand',
                    title: 'Expand',
                    selector: 'node',
                    onClickFunction: event => this._expandNode(event)
                },
                {
                    id: 'hide',
                    title: 'Hide',
                    selector: 'node',
                    onClickFunction: event => this._hideNode(event)
                },
                {
                    id: 'hide-others',
                    title: 'Hide Others',
                    selector: 'node',
                    onClickFunction: event => this._hideOtherNodes(event)
                }
            ]
        };
        this.cy.contextMenus(options);
    }

    _showDetails(event) {
        let target = event.cyTarget;
        if (target.isNode()) {
            let process = this.getProcessFromEvent(event);
            this.experimentsAPI.getProcessForExperiment(this.projectId, this.experimentId, process.id).then(
                p => this.mcshow.processDetailsDialog(p, false).then(
                    updatedProcess => target.data('name', updatedProcess.name)
                )
            );
        }
    }

    _cloneProcess(event) {
        let process = this.getProcessFromEvent(event);
        this.workflowService.cloneProcess(this.projectId, this.experimentId, process);
    }

    _deleteProcess(event) {
        let process = this.getProcessFromEvent(event);
        this.workflowService.deleteNodeAndProcess(this.projectId, this.experimentId, process.id);
    }

    _collapseNode(event) {
        let target = event.cyTarget;
        let nodes = getRemovableChildren(target);
        if (nodes.length) {
            let name = target.data('name');
            target.data('name', `+ ${name}`);
            target.data('collapsed', nodes);
            this.cy.remove(nodes);
        }
    }

    _expandNode(event) {
        let target = event.cyTarget;
        let collapsed = target.data('collapsed');
        if (collapsed) {
            collapsed.restore();
            let name = target.data('name').substring(1);
            target.data('name', name);
            target.data('collapsed', null);
        }
    }

    _hideNode(event) {
        let target = event.cyTarget;
        let nodes = getRemovableChildren(target);
        nodes = nodes.union(target);
        let hidden = this.cy.remove(nodes);
        if (this.hiddenNodes.length) {
            this.hiddenNodes = this.hiddenNodes.union(hidden);
        } else {
            this.hiddenNodes = hidden;
        }
    }

    _hideOtherNodes(event) {
        let target = event.cyTarget;
        let nodesToKeep = getRemovableChildren(target).union(target);
        let nodesToRemove = nodesToKeep.absoluteComplement();
        let hidden = this.cy.remove(nodesToRemove);
        if (this.hiddenNodes.length) {
            this.hiddenNodes = this.hiddenNodes.union(hidden);
        } else {
            this.hiddenNodes = hidden;
        }
    }

    _addChild(event) {
        let process = this.getProcessFromEvent(event);
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/workflow/mc-process-templates-dialog.html',
            controller: SelectProcessTemplateDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: true,
            locals: {
                parentProcess: process
            }
        });
    }

    getProcessFromEvent(event) {
        let target = event.cyTarget;
        let processId = target.data('id');
        let process = this.processes.filter((p) => p.id === processId)[0];
        process.hasChildren = (target.outgoers().length > 0);
        return process;
    }

}

class SelectProcessTemplateDialogController {
    /*@ngInject*/
    constructor($stateParams, $mdDialog, workflowService) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.workflowService = workflowService;
        this.keepOpen = false;
    }

    addSelectedProcessTemplate(templateId) {
        this.workflowService.addChildProcessFromTemplate(templateId, this.projectId, this.experimentId,
            this.parentProcess, this.keepOpen)
    }

    done() {
        this.$mdDialog.hide();
    }

}

angular.module('materialscommons').component('mcProcessesWorkflowGraph', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow-graph.html',
    controller: MCProcessesWorkflowGraphComponentController,
    bindings: {
        processes: '<',
        highlightProcesses: '<'
    }
});
