class MCProcessGraphOutlineComponentController {
    /*@ngInject*/
    constructor() {
    }

    $onInit() {
        let treeModel = new TreeModel();
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
                let n = treeModel.parse(p);
                addedIds.push(p.id);
                this.rootNode.addChild(n);
            }
        });

        // Go through each node that has been added in the tree adding its immediate children.
        // Keep looping over newly added nodes until no more are added.
        let newlyAdded = [];
        while (true) {
            addedIds.forEach(id => {
                let n = this.root.first(node => node.model.id === id);
                n.model.output_samples.forEach(s => {
                    let id = `${s.id}/${s.property_set_id}`;
                    let processes = sample2InputProcesses[id];
                    if (processes && processes.length) {
                        processes.forEach(p => {
                            p.children = [];
                            let node = treeModel.parse(p);
                            n.addChild(node);
                            newlyAdded.push(p.id);
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

class MCProcessGraphOutlineDirDirectiveController {
    /*@ngInject*/
    constructor() {
    }
}

function mcProcessGraphOutlineDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            process: '='
        },
        controller: MCProcessGraphOutlineDirDirectiveController,
        replace: true,
        controllerAs: '$ctrl',
        bindToController: true,
        templateUrl: 'app/global.components/graph/outline/mc-process-graph-outline-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function() {});
        }
    }
}

angular.module('materialscommons').directive('mcProcessGraphOutlineDir', mcProcessGraphOutlineDirDirective);

angular.module('materialscommons').component('mcProcessGraphOutline', {
    templateUrl: 'app/global.components/graph/outline/mc-process-graph-outline.html',
    controller: MCProcessGraphOutlineComponentController,
    bindings: {
        processes: '<'
    }
});
