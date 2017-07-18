/* global cytoscape:true */
class CyGraphService {
    /*@ngInject*/
    constructor($mdDialog, workflowState) {
        this.$mdDialog = $mdDialog;
        this.workflowState = workflowState;
    }

    createGraph(elements, domId) {
        let cy = cytoscape({
            container: document.getElementById(domId),
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'content': 'data(name)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': 'data(color)',
                        color: 'black',
                        'text-outline-color': (ele) => {
                            let c = ele.data('color');
                            return c ? c : '#fff';
                        },
                        'font-size': '18px',
                        'font-weight': 'bold',
                        'text-outline-width': '5px',
                        'text-outline-opacity': 1,
                        'border-width': '4px',
                        'border-color': (ele) => {
                            let highlight = ele.data('highlight');
                            return highlight ? highlight : '#fff';
                        },
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

        this.setupQTips(cy);

        cy.layout({name: 'dagre', fit: true});
        cy.panzoom();

        return cy;
    }

    setupQTips(cy) {
        cy.elements().filter((i, ele) => ele.isNode()).qtip({
            content: function() {
                return `
                <h5>${this.data('name')}</h5>
                <b>Template: </b>${this.data('details').template_name}
                <br/>
                <b>Type: </b>${this.data('details').process_type}
                <br/>
                <b>Input Samples(${this.data('details').input_samples.length}): </b>${this.data('input_sample_names')}
                <br/>
                <b>Output Samples(${this.data('details').output_samples.length}): </b>${this.data('output_sample_names')}
                <br/>
                <b>Files(${this.data('details').files.length}): </b>${this.data('file_names')}
                `;
            },
            show: {event: 'mouseenter mouseover'},
            hide: {event: 'mouseout unfocus'}
        });

        cy.elements().filter((i, ele) => ele.isEdge()).qtip({
            content: function() {
                return this.data('details').names;
            },
            show: {event: 'mouseenter mouseover'},
            hide: {event: 'mouseout unfocus'}
        });
    }

    setOnClickForExperiment(cy, projectId, experimentId) {
        cy.on('click', event => {
            let target = event.cyTarget;
            if (!target.isNode && !target.isEdge) {
                this.workflowState.updateSelectedProcessForExperiment(projectId, experimentId, null);
            } else if (target.isNode()) {
                let process = target.data('details');
                let hasChildren = (target.outgoers().length > 0);
                this.workflowState.updateSelectedProcessForExperiment(projectId, experimentId, process, hasChildren);
            } else if (target.isEdge()) {
                this.workflowState.updateSelectedProcessForExperiment(projectId, experimentId, null);
            }
        });
    }

    setOnClickForDataset(cy) {
        cy.on('click', event => {
            let target = event.cyTarget;
            if (!target.isNode && !target.isEdge) {
                this.workflowState.updateSelectedProcessForDataset(null);
            } else if (target.isNode()) {
                let process = target.data('details');
                let hasChildren = (target.outgoers().length > 0);
                this.workflowState.updateSelectedProcessForDataset(process, hasChildren);
            } else if (target.isEdge()) {
                this.workflowState.updateSelectedProcessForDataset(null);
            }
        })
    }

    addEdgeHandles(cy, completeFN) {
        let edgeConfig = {
            toggleOffOnLeave: true,
            handleNodes: 'node',
            handleSize: 10,
            edgeType: (source, target) => {
                let sourceProcess = source.data('details');
                let targetProcess = target.data('details');
                if (sourceProcess.output_samples.length === 0) {
                    // source process has not output samples
                    this._showAlert('No output samples to connect to process.');
                    return null;
                } else if (targetProcess.template_name === 'Create Samples') {
                    // Create samples cannot be a target
                    this._showAlert('Create Samples process type cannot be a target.');
                    return null;
                } else if (CyGraphService._targetHasAllSourceSamples(targetProcess.input_samples, sourceProcess.output_samples)) {
                    // Target already has all the source samples
                    this._showAlert('Processes are already connected.');
                    return null;
                }
                return 'flat';
            },
            complete: completeFN
        };

        cy.edgehandles(edgeConfig);
    }

    static _targetHasAllSourceSamples(targetSamples, sourceSamples) {
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

    _showAlert(message) {
        this.$mdDialog.show(this.$mdDialog.alert()
            .title('Invalid Target Process')
            .textContent(message)
            .ok('dismiss'));
    }

    getRemovableSuccessors(node, hideOthers = true) {
        let removeableNodes = node.successors().filter((i, ele) => {
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
                return hideOthers ? hasTargetAsParent : !hasTargetAsParent;
            }
        });

        return removeableNodes.union(removeableNodes.connectedEdges());
    }

    collapseNode(cy, event) {
        let target = event.cyTarget;
        let nodes = this.getRemovableSuccessors(target, false);
        if (nodes.length) {
            let name = target.data('name');
            target.data('name', `+ ${name}`);
            target.data('collapsed', nodes);
            cy.remove(nodes);
        }
    }

    expandNode(event) {
        let target = event.cyTarget;
        let collapsed = target.data('collapsed');
        if (collapsed) {
            collapsed.restore();
            let name = target.data('name').substring(1);
            target.data('name', name);
            target.data('collapsed', null);
        }
    }

    hideNode(cy, event) {
        let target = event.cyTarget;
        let nodes = this.getRemovableSuccessors(target, false);
        nodes = nodes.union(target);
        return cy.remove(nodes);
    }

    hideOtherNodes(cy, event) {
        let target = event.cyTarget;
        let nodesToKeep = this.getRemovableSuccessors(target).union(target);
        let nodesToRemove = nodesToKeep.absoluteComplement();
        return cy.remove(nodesToRemove);
    }

// Use this to show/hide certain menu items
    // this.cy.on('cxttap', event => {
    //     console.log('cxttap');
    //     let target = event.cyTarget;
    //     if (target.isNode()) {
    //         console.log(' -- target is node', target.data('name'));
    //     }
    // });
}

angular.module('materialscommons').service('cyGraph', CyGraphService);
