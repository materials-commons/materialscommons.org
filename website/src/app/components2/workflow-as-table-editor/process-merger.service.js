class ProcessMergerService {
    /*@ngInject*/
    constructor(processTree) {
        this.processTree = processTree;
    }

    mergeProcesses(processes) {
        let t = this.processTree.build(processes, []);
        let roots = [];
        t.rootNode.children.forEach(child => {
            let tm = new TreeModel();
            let root = tm.parse(child);
            roots.push(root);
        });
        roots.forEach(tree => {

            let treeNodeHashes = {};
            tree.walk(node => {
                let nodePath = node.getPath();
                let s = '';
                nodePath.forEach(node => {
                    s += node.model.model.template_id;
                });
                if (s in treeNodeHashes) {
                    let count = treeNodeHashes[s];
                    count++;
                    treeNodeHashes[s] = count;
                    s = `s${count}`;
                } else {
                    treeNodeHashes[s] = 1;
                }
                node.model.model.node_id = s.slice(0);
            });
        });
        let firstTree = roots[0];
        for (let i = 1; i < roots.length; i++) {
            this.mergeNodes(firstTree, roots[i]);
        }

        let orderedProcesses = [];
        firstTree.walk(node => orderedProcesses.push(node.model.model));
        return orderedProcesses.filter(p => p.process_type !== 'create');
    }

    mergeNodes(n1, n2) {
        let n1HasN2Child, i, n2Child, n1Child;
        let id = n1.model.model.node_id;

        // Add missing samples to node
        this.addMissingSamples(n2, n1);

        // Check which n2 children are present in n1
        n1HasN2Child = n2.children.map(node => {
            return n1.children.some(n1node => n1node.model.model.node_id === node.model.model.node_id);
        });
        //this.hasChild(n1));

        // Iterate over n2 children
        for (i = 0; i < n1HasN2Child.length; i++) {
            n2Child = n2.children[i];
            if (n1HasN2Child[i]) {
                // n1 already has this n2 child, so lets merge them
                n1Child = n1.first({strategy: 'breadth'}, n => id === n.model.model.node_id);
                this.mergeNodes(n1Child, n2Child);
            } else {
                // n1 does not have this n2 child, so add it
                if (n2Child.model.model.input_samples.length || n2Child.model.model.output_samples.length) {
                    n1.addChild(n2Child);
                }
            }
        }
    }

    addMissingSamples(fromTree, toTree) {
        let compareSamples = (sample, s) => (sample.id === s.id && sample.property_set_id === s.property_set_id);
        fromTree.walk(node => {
            let id = node.model.model.node_id;
            let addTo = toTree.first(n => id === n.model.model.node_id);
            if (addTo) {
                let samplesToAdd = [];
                node.model.model.input_samples.forEach(s => {
                    if (_.findIndex(addTo.model.model.input_samples, sample => compareSamples(sample, s)) === -1) {
                        samplesToAdd.push(s);
                    }
                });
                samplesToAdd.forEach(s => addTo.model.model.input_samples.push(s));

                samplesToAdd.length = 0;
                node.model.model.output_samples.forEach(s => {
                    if (_.findIndex(addTo.model.model.output_samples, sample => compareSamples(sample, s)) === -1) {
                        samplesToAdd.push(s);
                    }
                });
                samplesToAdd.forEach(s => addTo.model.model.output_samples.push(s));
            }
        });
    }
}

angular.module('materialscommons').service('processMerger', ProcessMergerService);