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

    createEdge(sourceProcessId, targetProcessId, edgeName, sample) {
        return {
            data: {
                id: `${targetProcessId}_${sourceProcessId}`,
                source: sourceProcessId,
                target: targetProcessId,
                name: edgeName,
                details: {
                    samples: [sample],
                    names: sample.name
                }
            }
        };
    }

    addSampleToEdge(edge, sample) {
        let details = edge.data('details');
        details.samples.push(sample);

        if (edge.data('details').samples.length > 1) {
            edge.data('name', `${edge.data('details').samples[0].name} + ${edge.data('details').samples.length - 1} more`);
            details.names += `, ${details.samples.name}`;
        }

        edge.data('details', details);

        return edge;
    }

    createConnectingEdges(targetProcess, processes) {
        let sample2InputProcesses = {},
            edges = [];
        targetProcess.input_samples.forEach(s => {
            let id = `${s.id}/${s.property_set_id}`;
            if (!(id in sample2InputProcesses)) {
                sample2InputProcesses[id] = [];
            }
            sample2InputProcesses[id].push(targetProcess);
        });

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
                    input_sample_names: p.input_samples.map(s => s.name).join(','),
                    output_sample_names: p.output_samples.map(s => s.name).join(','),
                    file_names: ProcessGraphService.buildFileNames(p),
                    color: ProcessGraphService.processColor(p),
                    shape: ProcessGraphService.processShape(p),
                    highlight: ProcessGraphService.highlightColor(p, highlightedProcesses)
                }
            };
        });

        let edgesMap = {};

        processes.filter(p => p.does_transform).forEach(p => {
            p.output_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                let processes = sample2InputProcesses[id];
                if (processes && processes.length) {
                    processes.forEach(proc => {
                        let edgeId = `${proc.id}_${p.id}`;
                        if (edgeId in edgesMap) {
                            let edge = edgesMap[edgeId];
                            edge.data.details.samples.push(s);
                            edge.data.details.names += `, ${s.name}`;
                        } else {
                            let newEdge = {
                                data: {
                                    id: edgeId,
                                    source: p.id,
                                    target: proc.id,
                                    name: s.name,
                                    details: {
                                        samples: [s],
                                        names: s.name
                                    }
                                }
                            };
                            elements.push(newEdge);
                            edgesMap[edgeId] = newEdge;
                        }
                    });
                }
            });
        });

        elements.forEach(e => {
            if (e.data.source && e.data.details.samples.length > 1) {
                e.data.name += ` + ${e.data.details.samples.length - 1} more`;
            }
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

    static buildFileNames(process) {
        if (process.files.length === 0 && process.files_count) {
            return "Files list will load when you view process details...";
        }

        if (process.files.length === 0 && process.files_count === 0) {
            return "No files..."
        }
        if (process.files.length > 20) {
            let first20 = process.files.slice(1, 19);
            let names = first20.map(f => f.name).join(',') + `<br/>Plus ${process.files.length - 20} more...`;
            return names;
        }
        return process.files.map(f => f.name).join(',');
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
