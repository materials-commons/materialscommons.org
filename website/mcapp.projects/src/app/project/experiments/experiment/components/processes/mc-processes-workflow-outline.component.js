class MCProcessesWorkflowOutlineComponentController {
    /*@ngInject*/
    constructor(processTree) {
        this.processTree = processTree;
        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
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
    }

    // This method will be called implicitly when the component is loaded.
    $onChanges(changes) {
        if (changes.processes) {
            this.processes = changes.processes.currentValue;
        }
        if (changes.highlightProcesses) {
            this.highlightProcesses = changes.highlightProcesses.currentValue;
        }
        this.buildOutline();
    }

    buildOutline() {
        let t = this.processTree.build(this.processes, this.highlightProcesses);
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
        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
    }

    showDetails(p) {
        this.mcProcessesWorkflowOutline.showDetails(p);
    }
}

/*@ngInject*/
function mcProcessesWorkflowOutlineDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            process: '=',
            highlightProcesses: '=',
            dataset: '=',

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
        processes: '<',
        highlightProcesses: '<',
        dataset: '<'
    },
    require: {
        mcProcessesWorkflow: '^mcProcessesWorkflow'
    }
});
