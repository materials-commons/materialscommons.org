class MCProcessesGraphComponentController {
    /*@ngInject*/
    constructor() {
    }

    $onInit() {
        let transformingProcesses = this.processes.filter(p => p.does_transform);
        let sample2Process = {};
        transformingProcesses.forEach(p => {
            p.input_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                sample2Process[id] = p;
            });
        });
        let elements = this.processes.map(p => {
            console.log(p.name, p);
            return {
                data: {
                    id: p.id,
                    name: p.name
                }
            }
        });
        this.processes.filter(p => !p.does_transform).forEach(p => {
            p.input_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                let process = sample2Process[id];
                if (process) {
                    elements.push({
                        data: {
                            id: `${p.id}_${process.id}`,
                            source: process.id,
                            target: p.id
                        }
                    });
                }
            });
        });

        let sampleName2Sample = {};
        this.processes.forEach(p => {
            p.input_samples.forEach(s => {
                sampleName2Sample[s.name] = s;
            })
        });
        this.samples = _.values(sampleName2Sample);
        var cy = cytoscape({
            container: document.getElementById('processesGraph'),
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(name)'
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
        cy.layout({name: 'dagre'});
    }

    filterOnSample(sample) {

    }
}

angular.module('materialscommons').component('mcProcessesGraph', {
    templateUrl: 'app/global.components/graph/mc-processes-graph.html',
    controller: MCProcessesGraphComponentController,
    bindings: {
        processes: '<'
    }
});
