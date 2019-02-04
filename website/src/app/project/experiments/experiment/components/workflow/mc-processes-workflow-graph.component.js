class MCProcessesWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, workflowService, mcbus, experimentsAPI, $stateParams, mcstate, $filter,
                $mdDialog, mcshow, workflowState, cyGraph, $timeout, mcprojstore) {
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
        this.sidebarShowing = true;
        this.$timeout = $timeout;
        this.mcprojstore = mcprojstore;
        this.tooltips = true;
    }

    $onInit() {
        // To preserve this binding pass this.allProcessesGraph bound to an arrow function. Arrow
        // functions lexically scope, so this in the arrow function is the this for
        // MCProcessesWorkflowGraphComponentController
        let cb = (processes) => {
            this.processes = angular.copy(processes);
            this.allProcessesGraph();
        };

        this.mcstate.subscribe('WORKSPACE$MAXIMIZED', this.myName, (maximized) => {
            this.sidebarShowing = !maximized;
            this.$timeout(() => this.cy.fit(), 300);
        });

        this.mcbus.subscribe('PROCESSES$CHANGE', this.myName, cb);
        this.mcbus.subscribe('PROCESS$ADD', this.myName, (process) => {
            let node = this.processGraph.createProcessNode(process);
            this.cy.add(node);
            let edges = this.processGraph.createConnectingEdges(process, this.processes);
            if (edges.length) {
                this.cy.add(edges);
            }
            this.processes.push(angular.copy(process));
            this.cy.layout({name: 'dagre', fit: true});
            this.cyGraph.setupQTips(this.cy);
            if (!this.tooltips) {
                this.cyGraph.disableQTips(this.cy);
            }
        });
        this.mcbus.subscribe('PROCESS$DELETE', this.myName, (processId) => {
            let nodeToRemove = this.cy.filter(`node[id = "${processId}"]`);
            this.cy.remove(nodeToRemove);
            let i = _.findIndex(this.processes, {id: processId});
            if (i !== -1) {
                this.processes.splice(i, 1);
            }
        });

        this.mcbus.subscribe('PROCESS$CHANGE', this.myName, process => {
            this.cy.filter(`node[id="${process.id}"]`).forEach((ele) => {
                let name = (' ' + process.name).slice(1);
                ele.data('name', name);
            });
        });

        this.projectUnsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROJECT, this.mcprojstore.EVUPDATE, () => {
            const currentExperiment = this.mcprojstore.currentExperiment;
            if (currentExperiment && currentExperiment.processes !== null) {
                this.processes = _.values(currentExperiment.processes);
                this.allProcessesGraph();
            }
        });

        this.procUpdateUnsubscribe = this.mcprojstore.subscribe(this.mcprojstore.OTPROCESS, this.mcprojstore.EVUPDATE, process => {
            this.cy.filter(`node[id="${process.id}"]`).forEach((ele) => {
                let name = (' ' + process.name).slice(1);
                ele.data('name', name);
            });
        });

        this.mcbus.subscribe('EDGE$ADD', this.myName, ({samples, process}) => this.addEdge(samples, process));
        this.mcbus.subscribe('EDGE$DELETE', this.myName, (source, target) => console.log('EDGE$DELETE', source, target));
        this.mcbus.subscribe('WORKFLOW$HIDEOTHERS', this.myName, processes => {
            this._addToHidden(this.cyGraph.hideOtherNodesMultiple(this.cy, processes));
        });

        this.mcstate.subscribe('WORKFLOW$SEARCH', this.myName, (search) => {
            if (search === '') {
                if (this.removedNodes !== null) {
                    this.removedNodes.restore();
                    this.cy.layout({name: 'dagre', fit: true});
                }
                return;
            }
            this.removedNodes = this.cyGraph.searchProcessesInGraph(this.cy, search, this.processes);
        });

        this.mcbus.subscribe('WORKFLOW$RESTOREHIDDEN', this.myName, () => {
            if (this.hiddenNodes.length) {
                this.hiddenNodes.restore();
                this.hiddenNodes = [];
                this.cy.layout({name: 'dagre', fit: true});
            }
        });

        this.mcbus.subscribe('WORKFLOW$RESET', this.myName, () => {
            const currentExperiment = this.mcprojstore.currentExperiment;
            this.processes = _.values(currentExperiment.processes);
            this.allProcessesGraph();
        });
        this.mcbus.subscribe('WORKFLOW$NAVIGATOR', this.myName, () => {
            if (this.navigator === null) {
                this.navigator = this.cy.navigator();
            } else {
                this.navigator.destroy();
                this.navigator = null;
            }
        });

        this.mcbus.subscribe('WORKFLOW$FILTER$BYSAMPLES', this.myName, (samples) => {
            this.removedNodes = this.cyGraph.filterBySamples(this.cy, samples, this.processes);
        });

        this.mcstate.subscribe('WORKFLOW$TOOLTIPS', this.myName, (tooltipsEnabled) => {
            this.tooltips = tooltipsEnabled;
            if (tooltipsEnabled) {
                this.cyGraph.enableQTips(this.cy);
            } else {
                this.cyGraph.disableQTips(this.cy);
            }
        });
    }

    $onDestroy() {
        this.procUpdateUnsubscribe();
        this.projectUnsubscribe();
        this.mcbus.leave('PROCESSES$CHANGE', this.myName);
        this.mcbus.leave('WORKFLOW$RESTOREHIDDEN', this.myName);
        this.mcstate.leave('WORKFLOW$SEARCH', this.myName);
        this.mcbus.leave('WORKFLOW$RESET', this.myName);
        this.mcbus.leave('WORKFLOW$FILTER$BYSAMPLES', this.myName);
        this.mcbus.leave('PROCESS$ADD', this.myName);
        this.mcbus.leave('PROCESS$DELETE', this.myName);
        this.mcbus.leave('EDGE$ADD', this.myName);
        this.mcbus.leave('EDGE$DELETE', this.myName);
        this.mcstate.leave('WORKSPACE$MAXIMIZED', this.myName);
        this.mcbus.leave('WORKFLOW$HIDEOTHERS', this.myName);
        this.mcbus.leave('WORKFLOW$NAVIGATOR', this.myName);
        this.mcbus.leave('WORKFLOW$RESTOREHIDDEN', this.myName);
        if (this.navigator) {
            this.navigator.destroy();
        }

        if (this.cMenu) {
            this.cMenu.destroy();
        }
    }

    // This method will be called implicitly when the component is loaded.
    $onChanges(changes) {
        if (changes.processes) {
            this.processes = angular.copy(changes.processes.currentValue);
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

        this.setupContextMenus();
        let cb = (source, target, addedEntities) => this._completeFN(source, target, addedEntities);
        this.cyGraph.addEdgeHandles(this.cy, cb);
    }

    _completeFN(source, target, addedEntities) {
        let sourceProcess = source.data('details');
        let targetProcess = target.data('details');
        if (sourceProcess.output_samples.length === 1) {
            this.workflowService.addSamplesToProcess(this.projectId, this.experimentId, targetProcess, sourceProcess.output_samples).then(
                (process) => {
                    this.replaceProcess(process);
                    target.data('details', process);
                    addedEntities[0].data('name', sourceProcess.output_samples[0].name);
                    let names = sourceProcess.output_samples.map(s => s.name).join(',');
                    addedEntities[0].data('details', {
                        samples: sourceProcess.output_samples,
                        names: names
                    });
                    this.cyGraph.setupQTips(this.cy);
                    if (!this.tooltips) {
                        this.cyGraph.disableQTips(this.cy);
                    }
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
                                if (samples.length > 1) {
                                    addedEntities[0].data('name', `${samples[0].name} + ${samples.length - 1} more`);
                                } else {
                                    addedEntities[0].data('name', `${samples[0].name}`);
                                }

                                let names = samples.map(s => s.name).join(',');
                                addedEntities[0].data('details', {
                                    samples: samples,
                                    names: names
                                });
                                this.cyGraph.setupQTips(this.cy);
                                if (!this.tooltips) {
                                    this.cyGraph.disableQTips(this.cy);
                                }
                            }
                        );
                    }
                }
            );
        }
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
        for (let process of this.processes) {
            if (process.output_samples && process.output_samples.length) {
                for (let s of process.output_samples) {
                    if (s.sample_id === sample.id && s.property_set_id === sample.property_set_id) {
                        return process;
                    }
                }
            }
        }

        return null;
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
                    content: 'Show Details',
                    selector: 'node',
                    hasTrailingDivider: true,
                    onClickFunction: (event) => this._showDetails(event)
                },
                {
                    id: 'clone-process',
                    content: 'Clone Process',
                    selector: 'node',
                    onClickFunction: (event) => this._cloneProcess(event)
                },
                {
                    id: 'add-child',
                    content: 'Add Child',
                    selector: 'node',
                    onClickFunction: (event) => this._addChild(event)
                },
                {
                    id: 'delete-process',
                    content: 'Delete Process',
                    selector: 'node',
                    hasTrailingDivider: true,
                    onClickFunction: (event) => this._deleteProcess(event)
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
        this.cMenu = this.cy.contextMenus(options);
    }

    _showDetails(event) {
        let target = event.cyTarget;
        if (target.isNode()) {
            let process = this.getProcessFromEvent(event);
            this.mcprojstore.currentProcess = process;
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

    _addToHidden(hidden) {
        if (this.hiddenNodes.length) {
            this.hiddenNodes = this.hiddenNodes.union(hidden);
        } else {
            this.hiddenNodes = hidden;
        }
    }

    _addChild(event) {
        let process = this.getProcessFromEvent(event);
        this.$mdDialog.show({
            templateUrl: 'app/modals/mc-process-templates-dialog.html',
            controller: SelectProcessTemplateDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
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
            this.parentProcess, this.keepOpen);
    }

    done() {
        this.$mdDialog.hide();
    }

}

angular.module('materialscommons').component('mcProcessesWorkflowGraph', {
    template: require('./mc-processes-workflow-graph.html'),
    controller: MCProcessesWorkflowGraphComponentController,
    bindings: {
        processes: '<',
        highlightProcesses: '<'
    }
});
