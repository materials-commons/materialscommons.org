/* global cytoscape:true */
class MCProcessesWorkflowGraphComponentController {
    /*@ngInject*/
    constructor() {
        this.cy = null;
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
        let sample2InputProcesses = {};
        let sample2OutputProcesses = {};

        this.processes.forEach(p => {
            p.input_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                if (!(id in sample2InputProcesses)) {
                    sample2InputProcesses[id] = [];
                }
                sample2InputProcesses[id].push(p);
            });

            p.output_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                if (!(id in sample2OutputProcesses)) {
                    sample2OutputProcesses[id] = [];
                }
                sample2OutputProcesses[id].push(p);
            })
        });

        // Draw all processes
        let elements = this.processes.map(p => {
            return {
                data: {
                    id: p.id,
                    name: p.name,
                    color: MCProcessesWorkflowGraphComponentController.processColor(p),
                    shape: MCProcessesWorkflowGraphComponentController.processShape(p)
                }
            };
        });
        this.processes.filter(p => p.does_transform).forEach(p => {
            p.output_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                let processes = sample2InputProcesses[id];
                if (processes && processes.length) {
                    processes.forEach(proc => {
                        elements.push({
                            data: {
                                id: `${proc.id}_${p.id}`,
                                source: p.id,
                                target: proc.id,
                                name: s.name
                            }
                        });
                    });
                }
            });
        });

        let sampleName2Sample = {};
        this.processes.forEach(p => {
            p.input_samples.forEach(s => {
                sampleName2Sample[s.name] = s;
            });
            p.output_samples.forEach(s => {
                sampleName2Sample[s.name] = s;
            });
        });
        this.samples = _.values(sampleName2Sample);
        this.cy = cytoscape({
            container: document.getElementById('processesGraph'),
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

    static processColor(p) {
        switch (p.process_type) {
            case "transform":
                return p.destructive ? "#d32f2f" : "#fbc02d";
            case "measurement":
                return p.destructive ? "#d32f2f" : "#cfd8dc";
            case "analysis":
                return "#d1c4e9";
            case "create":
                return "#ffecb3";
            case "import":
                return "#b2dfdb";
        }
    }

    static processShape(p) {
        switch (p.process_type) {
            case "transform":
                return "triangle";
            case "measurement":
                return "ellipse";
            case "analysis":
                return "roundrectangle";
            case "create":
                return "diamond";
            case "import":
                return "diamond";
        }
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
