class ProcessMergerService {
    /*@ngInject*/
    constructor(processTree) {
        this.processTree = processTree;
    }

    mergeProcessesForSamples(samples) {
        let processes = [];
        samples.forEach(s => {
            processes.push(s.processes.filter(p => p.process_type !== 'create').map(p => p.template_name));
        });

        return this._merger(processes);
    }

    _allEmpty(lists) {
        let isEmpty = true;
        lists.forEach(l => {
            if (l.length) {
                isEmpty = false;
            }
        });

        return isEmpty;
    }

    _merger(lists) {
        let accumulator = [];

        let currentIndex = 0;
        let current = '';
        let startNew = false;
        for (; ;) {
            if (this._allEmpty(lists)) {
                break;
            }
            let matchFound = false;
            for (let i = 0; i < lists.length; i++) {
                if (currentIndex === lists.length) {
                    currentIndex = 0;
                }

                if (lists[currentIndex].length) {
                    if (current === '') {
                        current = lists[currentIndex][0];
                        accumulator.push(current);
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    } else if (lists[currentIndex][0] === current && startNew) {
                        accumulator.push(current);
                        startNew = false;
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    } else if (lists[currentIndex][0] === current) {
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    }
                }
                currentIndex++;
            }

            if (!matchFound) {
                current = '';
                startNew = false;
            } else {
                startNew = true;
            }
        }

        return accumulator;
    }

    mergeProcessesForSamples2(samples) {
        let processes = [];
        samples.forEach(s => {
            processes.push(s.processes.filter(p => p.process_type !== 'create')
                .map(p => ({name: p.template_name, processes: [p.id]})));
        });

        return this._merger2(processes);
    }

    _merger2(lists) {
        //console.log('_merger2', angular.copy(lists));
        let accumulator = [];

        let currentIndex = 0;
        let current = null;
        let startNew = false;
        for (; ;) {
            if (this._allEmpty(lists)) {
                break;
            }
            let matchFound = false;
            for (let i = 0; i < lists.length; i++) {
                if (currentIndex === lists.length) {
                    currentIndex = 0;
                }

                if (lists[currentIndex].length) {
                    if (current === null) {
                        current = angular.copy(lists[currentIndex][0]);
                        accumulator.push(current);
                        //console.log('pushing current==null', current);
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    } else if (lists[currentIndex][0].name === current.name && startNew) {
                        //console.log('lists[currentIndex][0].name === current.name && startNew', current);
                        accumulator.push(angular.copy(current));
                        startNew = false;
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    } else if (lists[currentIndex][0].name === current.name) {
                        current.processes = current.processes.concat(lists[currentIndex][0].processes);
                        lists[currentIndex].splice(0, 1);
                        matchFound = true;
                    }
                }
                currentIndex++;
            }

            if (!matchFound) {
                current = null;
                startNew = false;
            } else {
                startNew = true;
            }
        }

        return accumulator;
    }

    mergeProcessesForSamples3(processes) {
        // let processes = {};
        // samples.forEach(s => {
        //     s.processes.filter(p => p.process_type !== 'create').forEach(p => processes[p.id] = p);
        // });
        //
        // let toMerge = _.keys(processes).map(key => processes[key]);
        return this._merger3(processes);
    }

    _merger3(processesToMerge) {
        console.log('_merge3 ', processesToMerge);
        let t = this.processTree.build(processesToMerge, []);
        let workflows = this.buildWorkflowTypes(t);
        let processes = [];
        _.forEach(workflows, tree => tree.walk(node => processes.push(node.model.model)));
        return processes.filter(p => p.process_type !== 'create');
    }

    buildWorkflowTypes(t) {
        let roots = [];
        t.rootNode.children.forEach(child => {
            let tm = new TreeModel();
            let root = tm.parse(child);
            roots.push(root);
        });

        let workflows = {};
        roots.forEach(tree => {
            let s = '';
            tree.walk(node => {
                s += node.model.model.template_id;
                node.model.model.node_id = s.slice(0);
            });
            const hash = this.hashCode(s);
            tree.hash = hash;
            workflows[hash] = tree;
        });

        roots.forEach(tree => {
            if (tree !== workflows[tree.hash]) {
                let treeToAddTo = workflows[tree.hash];
                this.addMissingSamples(tree, treeToAddTo);
            }
        });

        console.log('workflows', workflows);
        return workflows;
    }

    hashCode(s) {
        return s.split('').reduce(function(a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    }

    addMissingSamples(fromTree, toTree) {
        console.log('addMissingSamples');
        fromTree.walk(node => {
            let id = node.model.model.node_id;
            let addTo = toTree.first(n => id === n.model.model.node_id);
            let samplesToAdd = [];
            node.model.model.input_samples.forEach(s => {
                if (_.findIndex(addTo.model.model.input_samples, sample => (sample.id === s.id && sample.property_set_id === s.property_set_id)) === -1) {
                    samplesToAdd.push(s);
                }
            });
            samplesToAdd.forEach(s => addTo.model.model.input_samples.push(s));

            samplesToAdd.length = 0;
            node.model.model.output_samples.forEach(s => {
                if (_.findIndex(addTo.model.model.output_samples, sample => (sample.id === s.id && sample.property_set_id === s.property_set_id)) === -1) {
                    samplesToAdd.push(s);
                }
            });
            samplesToAdd.forEach(s => addTo.model.model.output_samples.push(s));
            console.log('addTo', addTo);
        });
    }

    //=====================================

// Update the size of n1 to that of n2
    updateSize(n1, n2) {
        if (n2.model.size) {
            n1.model.size = n2.model.size;
        } else {
            delete n1.model.size;
        }
    }

// Check if n1 and n2 have the same id
    idEq(n1) {
        return function(n2) {
            return n1.model.id === n2.model.id;
        };
    }

// Check if n1 contains the given n2 child
    hasChild(n1) {
        return function(n2Child) {
            return n1.children.some(idEq(n2Child));
        };
    }

    mergeNodes(n1, n2) {
        var n1HasN2Child, i, n2Child, n1Child;

        // Update the sizes
        this.updateSize(n1, n2);

        // Check which n2 children are present in n1
        n1HasN2Child = n2.children.map(this.hasChild(n1));

        // Iterate over n2 children
        for (i = 0; i < n1HasN2Child.length; i++) {
            n2Child = n2.children[i];
            if (n1HasN2Child[i]) {
                // n1 already has this n2 child, so lets merge them
                n1Child = n1.first({strategy: 'breadth'}, this.idEq(n2Child));
                this.mergeNodes(n1Child, n2Child);
            } else {
                // n1 does not have this n2 child, so add it
                n1.addChild(n2Child);
            }
        }
    }

}

angular.module('materialscommons').service('processMerger', ProcessMergerService);