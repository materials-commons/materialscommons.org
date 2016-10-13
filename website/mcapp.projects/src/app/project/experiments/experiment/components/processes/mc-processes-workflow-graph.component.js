/* global cytoscape:true */
class MCProcessesWorkflowGraphComponentController {
    /*@ngInject*/
    constructor(processGraph) {
        this.cy = null;
        this.processGraph = processGraph;
    }

    $onInit() {
        // To preserve this binding pass this.allProcessesGraph bound to an arrow function. Arrow
        // functions lexically scope, so this in the arrow function is the this for
        // MCProcessesWorkflowGraphComponentController
        let cb = (processes) => {
            this.processes = processes;
            this.allProcessesGraph();
        };

        this.mcProcessesWorkflow.setDeleteProcessCallback(cb);
        this.mcProcessesWorkflow.setOnChangeCallback(cb);
        this.mcProcessesWorkflow.setAddProcessCallback(cb);

        // Draw graph
        this.allProcessesGraph();
    }

    allProcessesGraph() {
        let g = this.processGraph.build(this.processes);
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
                this.mcProcessesWorkflow.setSelectedProcess(null);
            } else if (target.isNode()) {
                let processId = target.data('id');
                this.mcProcessesWorkflow.setSelectedProcess(processId, (target.outgoers().length > 0));
            } else if (target.isEdge()) {
                this.mcProcessesWorkflow.setSelectedProcess(null);
            }
        });
        //this.cy.on('mouseover', function(event) {
        //    let target = event.cyTarget;
        //    if (target.data) {
        //        //console.log('target', target.data('name'));
        //    }
        //    // Need to install qtip or some other
        //    //target.qtip({
        //    //    content: target.data('name')
        //    //});
        //});
        this.cy.layout({name: 'dagre'});
    }

}

angular.module('materialscommons').component('mcProcessesWorkflowGraph', {
    templateUrl: 'app/project/experiments/experiment/components/processes/mc-processes-workflow-graph.html',
    controller: MCProcessesWorkflowGraphComponentController,
    bindings: {
        processes: '<'
    },
    require: {
        mcProcessesWorkflow: '^mcProcessesWorkflow'
    }
});
