class MCWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph, cyGraph, mcWorkflowGraphEvents) {
        this.processGraph = processGraph;
        this.cyGraph = cyGraph;
        this.mcWorkflowGraphEvents = mcWorkflowGraphEvents;
        this.state = {
            processes: [],
            samples: [],
            cy: null,
            currentProcess: null,
        };
    }

    $onChanges(changes) {
        if (changes.processes) {
            this.state.processes = angular.copy(changes.processes.currentValue);
            this.drawWorkflow();
        }

        if (changes.processAdded) {
            this.addProcessToWorkflow(changes.processAdded.currentValue);
        }
    }


    $onInit() {
        this.mcWorkflowGraphEvents.subscribe('PROCESS$ADD', (process) => {
            let node = this.processGraph.createProcessNode(process);
            this.state.cy.add(node);
            let edges = this.processGraph.createConnectingEdges(process, this.state.processes);
            if (edges.length) {
                this.state.cy.add(edges);
            }
            this.state.processes.push(angular.copy(process));
            this.state.cy.layout({name: 'dagre', fit: true});
            this.cyGraph.setupQTips(this.cy);
            if (!this.tooltips) {
                this.cyGraph.disableQTips(this.cy);
            }
        });

        this.mcWorkflowGraphEvents.subscribe('PROCESS$DELETE', (processId) => {
            let nodeToRemove = this.state.cy.filter(`node[id = "${processId}"]`);
            this.state.cy.remove(nodeToRemove);
            let i = _.findIndex(this.state.processes, {id: processId});
            if (i !== -1) {
                this.state.processes.splice(i, 1);
            }
        });

        this.mcWorkflowGraphEvents.subscribe('PROCESS$CHANGE', process => {
            this.state.cy.filter(`node[id="${process.id}"]`).forEach((ele) => {
                let name = (' ' + process.name).slice(1);
                ele.data('name', name);
            });
        });

        this.mcWorkflowGraphEvents.subscribe('EDGE$ADD', ({samples, process}) => this.addEdge(samples, process));
        this.mcWorkflowGraphEvents.subscribe('WORKFLOW$HIDEOTHERS', processes => {
            this._addToHidden(this.cyGraph.hideOtherNodesMultiple(this.state.cy, processes));
        });

        this.mcWorkflowGraphEvents.subscribe('WORKFLOW$SEARCH', (search) => {
            if (search === '') {
                if (this.removedNodes !== null) {
                    this.removedNodes.restore();
                    this.state.cy.layout({name: 'dagre', fit: true});
                }
                return;
            }
            this.removedNodes = this.cyGraph.searchProcessesInGraph(this.cy, search, this.processes);
        });

        this.mcWorkflowGraphEvents.subscribe('WORKFLOW$RESTOREHIDDEN', () => {
            if (this.hiddenNodes.length) {
                this.hiddenNodes.restore();
                this.hiddenNodes = [];
                this.state.cy.layout({name: 'dagre', fit: true});
            }
        });

        this.mcWorkflowGraphEvents.subscribe('WORKFLOW$RESET', () => {
            this.drawWorkflow();
        });

        this.mcWorkflowGraphEvents.subscribe('WORKFLOW$NAVIGATOR', () => {
            if (this.navigator === null) {
                this.navigator = this.state.cy.navigator();
            } else {
                this.navigator.destroy();
                this.navigator = null;
            }
        });

        this.mcWorkflowGraphEvents.subscribe('WORKFLOW$FILTER$BYSAMPLES', (samples) => {
            this.removedNodes = this.cyGraph.filterBySamples(this.state.cy, samples, this.state.processes);
        });

        this.mcWorkflowGraphEvents.subscribe('WORKFLOW$TOOLTIPS', (tooltipsEnabled) => {
            this.tooltips = tooltipsEnabled;
            if (tooltipsEnabled) {
                this.cyGraph.enableQTips(this.cy);
            } else {
                this.cyGraph.disableQTips(this.cy);
            }
        });

    }

    $onDestroy() {
        this.mcWorkflowGraphEvents.leave();
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
                this.state.currentProcess = process;
                this.onSetCurrentProcess({process: process});
            }
        });
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
        for (let process of this.state.processes) {
            if (process.output_samples) {
                for (let s of process.output_samples) {
                    if (s.id === sample.id && s.property_set_id === sample.property_set_id) {
                        return process;
                    }
                }
            }
        }

        return null;
    }
}

angular.module('materialscommons').component('mcWorkflowGraph', {
    controller: MCWorkflowGraphComponentController,
    template: require('./workflow-graph.html'),
    bindings: {
        processes: '<',
        samplesAdded: '<',
        onSetCurrentProcess: '&'
    }
});