class MCDatasetWorkflowOutlineComponentController {
    /*@ngInject*/
    constructor() {
        this.processes = this.dataset.processes;
        this.showOutline = true;
    }

    $onInit() {
        let treeModel = new TreeModel();  // eslint-disable-line no-undef
        this.root = treeModel.parse({id: 1, children: []});
        this.rootNode = this.root.first(node => node.model.id === 1);
        let sample2InputProcesses = {};
        this.processes.forEach(p => {
            p.input_samples.forEach(s => {
                let id = `${s.id}/${s.property_set_id}`;
                if (!(id in sample2InputProcesses)) {
                    sample2InputProcesses[id] = [];
                }
                sample2InputProcesses[id].push(p);
            });
        });
        let addedIds = [];
        this.processes.forEach(p => {
            if (!p.input_samples.length) {
                // No inputs so top level node
                p.children = [];
                p.show = true;
                let n = treeModel.parse(p);
                addedIds.push(p.id);
                this.rootNode.addChild(n);
            }
        });

        // Go through each node that has been added in the tree adding its immediate children.
        // Keep looping over newly added nodes until no more are added.
        let newlyAdded = [];
        while (true) {  // eslint-disable-line no-constant-condition
            addedIds.forEach(id => {
                let n = this.root.first(node => node.model.id === id);
                n.model.output_samples.forEach(s => {
                    let id = `${s.id}/${s.property_set_id}`;
                    let processes = sample2InputProcesses[id];
                    if (processes && processes.length) {
                        let nodeProcessEntries = _.indexBy(n.model.children, 'id');
                        processes.forEach(p => {
                            if (!(p.id in nodeProcessEntries)) {
                                p.children = [];
                                p.show = true;
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
    }
}

class MCDatasetWorkflowOutlineDirDirectiveController {
    /*@ngInject*/
    constructor() {
    }
}

/*@ngInject*/
function MCDatasetWorkflowOutlineDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            process: '='
        },
        controller: MCDatasetWorkflowOutlineDirDirectiveController,
        replace: true,
        controllerAs: '$ctrl',
        bindToController: true,
        template: require('./mc-dataset-workflow-outline-dir.html'),
        compile: function(element) {
            return RecursionHelper.compile(element, function() {
            });
        }
    }
}

angular.module('materialscommons').component('mcDatasetWorkflowOutline', {
    template: require('./mc-dataset-workflow-outline.html'),
    controller: MCDatasetWorkflowOutlineComponentController,
    bindings: {
        dataset: '<'
    }
});

angular.module('materialscommons').directive('mcDatasetWorkflowOutlineDir', MCDatasetWorkflowOutlineDirDirective);
