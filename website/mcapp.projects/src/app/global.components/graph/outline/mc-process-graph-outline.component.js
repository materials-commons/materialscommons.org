class MCProcessGraphOutlineComponentController {
    /*@ngInject*/
    constructor(processTree) {
        this.processTree = processTree;
    }

    $onInit() {
        // To preserve this binding pass this.allProcessesGraph bound to an arrow function. Arrow
        // functions lexically scope, so this in the arrow function is the this for
        // MCProcessGraphOutlineComponentController
        let cb = (processes) => {
            this.processes = processes;
            this.buildOutline();
        };

        this.mcProcessesWorkflow.setDeleteProcessCallback(cb);
        this.mcProcessesWorkflow.setOnChangeCallback(cb);
        this.mcProcessesWorkflow.setAddProcessCallback(cb);

        this.buildOutline();
    }

    buildOutline() {
        let t = this.processTree.build(this.processes);
        this.root = t.root;
        this.rootNode = t.rootNode;
    }

    showDetails(p) {
        this.mcProcessesWorkflow.setSelectedProcess(p.id, p.children.length !== 0);
    }
}

class MCProcessGraphOutlineDirDirectiveController {
    /*@ngInject*/
    constructor() {
    }

    showDetails(p) {
        console.log(this);
        this.mcProcessesWorkflow.setSelectedProcess(p.id, p.children.length !== 0);
    }
}

function mcProcessGraphOutlineDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            process: '=',

            // This needs to be passed in rather than required. It appears that RecursionHelper is
            // preventing the link function from being called, so we can't require mcProcessesWorkflow
            // and access it later.
            mcProcessesWorkflow: '='
        },
        controller: MCProcessGraphOutlineDirDirectiveController,
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
    },
    require: {
        mcProcessesWorkflow: '^mcProcessesWorkflow'
    }
});
