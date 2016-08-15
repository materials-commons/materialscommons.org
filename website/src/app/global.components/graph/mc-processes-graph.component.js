class MCProcessesGraphComponentController {
    /*@ngInject*/
    constructor(experimentsService, templates, $stateParams, toast, $mdDialog) {
        this.experimentsService = experimentsService;
        this.templates = templates;
        this.toast = toast;
        this.cy = null;
        this.displayGraph = 'all_processes';
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.$mdDialog = $mdDialog;
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
                        () => this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
                            .then(
                                (processes) => {
                                    this.processes = processes;
                                    this.allProcessesGraph();
                                },
                                () => toast.error('Error retrieving processes for experiment')
                            )
                    );
                },
                () => this.toast.error('Unable to add samples')
            );
    }

    allProcessesGraph() {
        let transformingProcesses = this.processes.filter(p => p.does_transform);
        let sample2InputProcess = {};
        let sample2OutputProcess = {};
        transformingProcesses.forEach(p => {
            p.input_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                sample2InputProcess[id] = p;
            });

            p.output_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                sample2OutputProcess[id] = p;
            })
        });
        let elements = this.processes.map(p => {
            //console.log(p.name, p);
            return {
                data: {
                    id: p.id,
                    name: p.name,
                    color: p.does_transform ? 'red' : '#999999'
                }
            }
        });
        this.processes.filter(p => !p.does_transform).forEach(p => {
            p.input_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                let process = sample2OutputProcess[id];
                if (process) {
                    elements.push({
                        data: {
                            id: `${p.id}_${process.id}`,
                            source: process.id,
                            target: p.id
                        }
                    });
                }
                process = sample2InputProcess[id];
                if (process) {
                    elements.push({
                        data: {
                            source: p.id,
                            target: process.id
                        }
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
                        'label': 'data(name)',
                        'background-color': 'data(color)'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 4,
                        'target-arrow-shape': 'triangle',
                        //'target-arrow-color': '#9dbaea',
                        'curve-style': 'bezier'
                    }
                }
            ]
        });
        this.cy.on('click', function(event) {
            console.log('node or edge clicked', event);
            let target = event.cyTarget;
            console.log('node name is', target.data('name'));
        });
        this.cy.layout({name: 'dagre'});
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
