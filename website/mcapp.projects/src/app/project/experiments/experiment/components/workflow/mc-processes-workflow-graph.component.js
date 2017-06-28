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
        this.mcbus.subscribe('PROCESS$ADD', this.myName, (process) => {
            this.processes.push(process);
            let node = this.processGraph.createProcessNode(process);
            this.cy.add(node);
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
                        //'text-outline-color': 'data(color)',
                        'text-outline-color': (ele) => {
                            let c = ele.data('color');
                            return c ? c : '#fff';
                        },
                        'font-size': '18px',
                        'font-weight': 'bold',
                        'text-outline-width': '5px',
                        'text-outline-opacity': 1,
                        'border-width': '4px',
                        //'border-color': 'data(highlight)',
                        'border-color': (ele) => {
                            let highlight = ele.data('highlight');
                            return highlight ? highlight : '#fff';
                        },
                        //shape: 'data(shape)',
                        shape: (ele) => {
                            let shape = ele.data('shape');
                            return shape ? shape : 'triangle';
                        },
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
        this.ctxMenu = this.setupContextMenus();
        let edgeConfig = {
            toggleOffOnLeave: true,
            handleNodes: 'node',
            handleSize: 10,
            edgeType: (source, target) => {
                let sourceProcess = source.data('details');
                let targetProcess = target.data('details');
                if (sourceProcess.output_samples.length === 0) {
                    // source process has not output samples
                    this.showAlert('No output samples to connect to process.');
                    return null;
                } else if (targetProcess.template_name === 'Create Samples') {
                    // Create samples cannot be a target
                    this.showAlert('Create Samples process type cannot be a target.');
                    return null;
                } else if (this.targetHasAllSourceSamples(targetProcess.input_samples, sourceProcess.output_samples)) {
                    // Target already has all the source samples
                    this.showAlert('Processes are already connected.');
                    return null;
                }
                return 'flat';
            },
            complete: (source, target, addedEntities) => {
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
                //console.log('addedEntities', addedEntities, addedEntities[0].isEdge());
            }
        };

        this.cy.edgehandles(edgeConfig);
    }

    replaceProcess(process) {
        let i = _.findIndex(this.processes, p => p.id === process.id);
        if (i !== -1) {
            this.processes.splice(i, 1);
            this.processes.push(process);
        }
    }

    showAlert(message) {
        this.$mdDialog.show(this.$mdDialog.alert()
            .title('Invalid Target Process')
            .textContent(message)
            .ok('dismiss'));
    }

    targetHasAllSourceSamples(targetSamples, sourceSamples) {
        let sourceSamplesSeen = {};
        sourceSamples.forEach((s) => {
            sourceSamplesSeen[`${s.sample_id}/${s.property_set_id}`] = false;
        });

        targetSamples.forEach(s => {
            let key = `${s.sample_id}/${s.property_set_id}`;
            if (key in sourceSamplesSeen) {
                sourceSamplesSeen[key] = true;
            }
        });
        let hasAllSamples = true;
        _.forOwn(sourceSamplesSeen, (value) => {
            if (!value) {
                hasAllSamples = false;
            }
        });

        return hasAllSamples;
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
                    hasTrailingDivider: true,
                    onClickFunction: (event) => this._addChild(event)
                },
                {
                    id: 'delete-process',
                    title: 'Delete Process',
                    selector: 'node',
                    onClickFunction: (event) => this._deleteProcess(event)
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
    },
    require: {
        mcProcessesWorkflow: '^mcProcessesWorkflow'
    }
});
