class ProcessTreeService {
    /*@ngInject*/
    constructor() {
    }

    build(processes, highlight) {
        let treeModel = new TreeModel();
        let root = treeModel.parse({id: 1, children: []});
        let rootNode = root.first(node => node.model.id === 1);
        let sample2InputProcesses = {};
        let highlightedProcesses = ProcessTreeService.buildHighlightedProcesses(highlight);
        processes.forEach(p => {
            p.input_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                if (!(id in sample2InputProcesses)) {
                    sample2InputProcesses[id] = [];
                }
                sample2InputProcesses[id].push(p);
            });
        });
        let addedIds = [];
        processes.forEach(p => {
            if (!p.input_samples.length) {
                // No inputs so top level node
                p.children = [];
                p.show = true;
                p.selected = false;
                p.highlight = p.id in highlightedProcesses;
                let n = treeModel.parse(p);
                addedIds.push(p.id);
                rootNode.addChild(n);
            }
        });

        // Go through each node that has been added in the tree adding its immediate children.
        // Keep looping over newly added nodes until no more are added.
        let newlyAdded = [];
        for (; ;) {
            addedIds.forEach(id => {
                let n = root.first(node => node.model.id === id);
                n.model.output_samples.forEach(s => {
                    let id = `${s.id}/${s.property_set_id}`;
                    let processes = sample2InputProcesses[id];
                    if (processes && processes.length) {
                        let nodeProcessEntries = _.indexBy(n.model.children, 'id');
                        processes.forEach(p => {
                            if (!(p.id in nodeProcessEntries)) {
                                p.children = [];
                                p.show = true;
                                p.selected = false;
                                p.highlight = p.id in highlightedProcesses;
                                let node = treeModel.parse(p);
                                n.addChild(node);
                                newlyAdded.push(p.id);
                            }
                        });
                    }
                });
            });
            if (newlyAdded.length) {
                addedIds.length = 0;
                addedIds = newlyAdded.slice(0);
                newlyAdded.length = 0;
            } else {
                break;
            }
        }
        return {root, rootNode};
    }

    clearSelected(root) {
        root.walk((node) => {
            node.model.selected = false;
        });
    }

    getSelected(root) {
        let selected = [];
        root.walk(node => {
            if (node.model.selected) {
                selected.push(node.model);
            }
        });
        return selected;
    }

    static buildHighlightedProcesses(highlightProcesses) {
        if (!highlightProcesses) {
            return {};
        } else {
            return _.indexBy(highlightProcesses, 'id');
        }
    }
}

angular.module('materialscommons').service('processTree', ProcessTreeService);
