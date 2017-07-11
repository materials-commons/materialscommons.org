class ProcessGraphService {
    /*@ngInject*/
    constructor() {
    }

    createProcessNode(process) {
        return {
            data: {
                id: process.id,
                name: process.name,
                details: process,
                color: ProcessGraphService.processColor(process),
                shape: ProcessGraphService.processShape(process),
                highlight: ProcessGraphService.highlightColor(process, [])
            }
        };
    }

    createEdge(sourceProcessId, targetProcessId, edgeName) {
        return {
            data: {
                id: `${targetProcessId}_${sourceProcessId}`,
                source: sourceProcessId,
                target: targetProcessId,
                name: edgeName
            }
        };
    }

    createConnectingEdges(targetProcess, processes) {
        let sample2InputProcesses = {},
            edges = [];
        console.log('targetProcess', targetProcess);
        targetProcess.input_samples.forEach(s => {
            let id = `${s.id}/${s.property_set_id}`;
            if (!(id in sample2InputProcesses)) {
                sample2InputProcesses[id] = [];
            }
            sample2InputProcesses[id].push(targetProcess);
        });

        console.log('sample2InputProcesses', sample2InputProcesses);
        processes.filter(p => p.does_transform).forEach(p => {
            p.output_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                let processes = sample2InputProcesses[id];
                if (processes && processes.length) {
                    processes.forEach(proc => {
                        edges.push({
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

        return edges;
    }

    build(processes, highlight) {
        let sample2InputProcesses = {};
        let sample2OutputProcesses = {};
        let highlightedProcesses = ProcessGraphService.buildHighlightedProcesses(highlight);

        processes.forEach(p => {
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
        let elements = processes.map(p => {
            return {
                data: {
                    id: p.id,
                    name: p.name,
                    details: p,
                    color: ProcessGraphService.processColor(p),
                    shape: ProcessGraphService.processShape(p),
                    highlight: ProcessGraphService.highlightColor(p, highlightedProcesses)
                }
            };
        });

        processes.filter(p => p.does_transform).forEach(p => {
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
        processes.forEach(p => {
            p.input_samples.forEach(s => {
                sampleName2Sample[s.name] = s;
            });
            p.output_samples.forEach(s => {
                sampleName2Sample[s.name] = s;
            });
        });

        let samples = _.values(sampleName2Sample);

        return {elements, samples};
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
            default:
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
            default:
                return "diamond";
        }
    }

    static highlightColor(p, highlightProcesses) {
        if (p.id in highlightProcesses) {
            return '#bbdefb';
        } else {
            return ProcessGraphService.processColor(p);
        }
    }

    static buildHighlightedProcesses(highlightProcesses) {
        if (!highlightProcesses) {
            return {};
        } else {
            return _.indexBy(highlightProcesses, 'id');
        }
    }
}

angular.module('materialscommons').service('processGraph', ProcessGraphService);
