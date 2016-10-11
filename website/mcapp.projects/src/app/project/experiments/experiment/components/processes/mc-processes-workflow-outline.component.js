class MCProcessesWorkflowOutlineComponentController {
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
        this.processTree.clearSelected(this.root);
        p.selected = true;
        this.mcProcessesWorkflow.setSelectedProcess(p.id, p.children.length !== 0);
    }
}

class MCProcessesWorkflowOutlineDirDirectiveController {
    /*@ngInject*/
    constructor() {
    }

    showDetails(p) {
        this.mcProcessesWorkflowOutline.showDetails(p);
    }
}

function mcProcessesWorkflowOutlineDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            process: '=',

            // This needs to be passed in rather than required. It appears that RecursionHelper is
            // preventing the link function from being called, so we can't require mcProcessesWorkflow
            // and access it later.
            mcProcessesWorkflowOutline: '='
        },
        controller: MCProcessesWorkflowOutlineDirDirectiveController,
        controllerAs: '$ctrl',
        bindToController: true,
        templateUrl: 'app/project/experiments/experiment/components/processes/mc-processes-workflow-outline-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function() {});
        }
    }
}

angular.module('materialscommons').directive('mcProcessesWorkflowOutlineDir', mcProcessesWorkflowOutlineDirDirective);

angular.module('materialscommons').component('mcProcessesWorkflowOutline', {
    templateUrl: 'app/project/experiments/experiment/components/processes/mc-processes-workflow-outline.html',
    controller: MCProcessesWorkflowOutlineComponentController,
    bindings: {
        processes: '<'
    },
    require: {
        mcProcessesWorkflow: '^mcProcessesWorkflow'
    }
});
