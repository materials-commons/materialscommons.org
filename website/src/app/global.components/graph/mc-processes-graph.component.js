class MCProcessesGraphComponentController {
    /*@ngInject*/
    constructor(experimentsService, templates, $stateParams, toast, $mdDialog, $timeout) {
        this.experimentsService = experimentsService;
        this.templates = templates;
        this.toast = toast;
        this.cy = null;
        this.displayGraph = 'all_processes';
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.$mdDialog = $mdDialog;
        this.$timeout = $timeout;
        this.selectedProcess = null;
    }

    $onInit() {
        this.allProcessesGraph();
    }

    addProcess(templateId) {
        this.experimentsService.createProcessFromTemplate(this.projectId, this.experimentId, `global_${templateId}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.$mdDialog.show({
                        templateUrl: 'app/global.components/graph/new-process-dialog.html',
                        controllerAs: '$ctrl',
                        controller: NewProcessDialogController,
                        bindToController: true,
                        locals: {
                            process: p
                        }
                    }).then(
                        () => {
                            this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
                                .then(
                                    (processes) => {
                                        this.processes = processes;
                                        this.allProcessesGraph();
                                    },
                                    () => this.toast.error('Error retrieving processes for experiment')
                                );
                        }
                    );
                },
                () => this.toast.error('Unable to add samples')
            );
    }

    onChange() {
        this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
            .then(
                (processes) => {
                    this.processes = processes;
                    this.allProcessesGraph();
                },
                () => this.toast.error('Error retrieving processes for experiment')
            );
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
        let elements = this.processes.filter(p => p.template_name !== 'Create Samples').map(p => {
            return {
                data: {
                    id: p.id,
                    name: p.name,
                    color: MCProcessesGraphComponentController.processColor(p),
                    shape: MCProcessesGraphComponentController.processShape(p)
                }
            };
        });
        this.processes.filter(p => p.does_transform && p.template_name !== 'Create Samples').forEach(p => {
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
                this.$timeout(() => {
                    this.selectedProcess = null;
                });
            } else if (target.isNode()) {
                let processId = target.data('id');
                this.experimentsService.getProcessForExperiment(this.projectId, this.experimentId, processId)
                    .then(
                        (process) => {
                            this.selectedProcess = this.templates.loadProcess(process);
                            this.currentTab = 2;
                        },
                        () => {
                            this.toast.error('Unable to retrieve process details');
                            this.selectedProcess = null;
                        }
                    );
            } else if (target.isEdge()) {
                this.$timeout(() => {
                    this.selectedProcess = null;
                    this.currentTab = 2;
                });
            }
        });
        this.cy.on('mouseover', function(event) {
            let target = event.cyTarget;
            if (target.data) {
                //console.log('target', target.data('name'));
            }
            // Need to install qtip or some other
            //target.qtip({
            //    content: target.data('name')
            //});
        });
        this.cy.layout({name: 'dagre'});
    }

    static processColor(p) {
        switch (p.process_type) {
            case "transform":
                return p.destructive ? "#d32f2f" : "#fbc02d";
            case "measurement":
                return p.destructive ? "#d32f2f" : "#616161";
            case "analysis":
                return "#512da8";
            case "create":
                return "#009688";
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
                return "vee";
            case "import":
                return "vee";
        }
    }

    showSelectedGraph() {
        console.log('selected graph', this.displayGraph);
    }

    onlyTransformationProcessesGraph() {
        console.log('onlyTransformationProcessesGraph');
    }

    sampleTransformationGraph() {
        console.log('sampleTransformationGraph');
    }

    filterOnSample(sample) {
        //console.log('filterOnSample', sample);
        let matches = [];
        this.cy.nodes().forEach(node => {
            console.log(node.data('id'));
        });
        console.log('matches', matches);
    }

}

class NewProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcProcessesGraph', {
    templateUrl: 'app/global.components/graph/mc-processes-graph.html',
    controller: MCProcessesGraphComponentController,
    bindings: {
        processes: '<'
    }
});
