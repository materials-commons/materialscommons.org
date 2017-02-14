class MCProcessesWorkflowOutlineComponentController {
    /*@ngInject*/
    constructor(processTree, datasetService, $stateParams, toast, experimentProcessesService, mcstate, mcbus) {
        this.processTree = processTree;
        this.datasetService = datasetService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.myName = 'mcProcessesWorkflowOutline';
        this.experimentProcessesService = experimentProcessesService;
        this.mcstate = mcstate;
        this.mcbus = mcbus;
    }

    $onInit() {
        // To preserve this binding pass this.allProcessesGraph bound to an arrow function. Arrow
        // functions lexically scope, so this in the arrow function is the this for
        // MCProcessGraphOutlineComponentController
        let cb = (processes) => {
            this.processes = processes;
            this.buildOutline();
        };

        this.datasetProcesses = this.mcProcessesWorkflow.datasetProcesses;

        this.mcbus.subscribe('PROCESSES$CHANGE', this.myName, cb);
        this.buildOutline();
    }

    $onDestroy() {
        this.mcbus.leave('PROCESSES$CHANGE', this.myName);
    }

    // This method will be called implicitly when the component is loaded.
    $onChanges(changes) {
        if (changes.processes) {
            this.processes = changes.processes.currentValue;
        }
        if (changes.highlightProcesses) {
            this.highlightProcesses = changes.highlightProcesses.currentValue;
        }
        if (this.datasetProcesses) {
            this.buildOutline();
        }
    }

    buildOutline() {
        let t = this.processTree.build(this.processes, this.highlightProcesses);
        this.root = t.root;
        this.rootNode = t.rootNode;
        if (this.dataset) {
            this.root.walk((node) => {
                node.model.inds = (node.model.id in this.datasetProcesses);
            });
        }
    }

    showDetails(p) {
        this.processTree.clearSelected(this.root);
        p.selected = true;
        this.process = p;
        this.mcProcessesWorkflow.setSelectedProcess(p.id, p.children.length !== 0);
    }

    toggle(p) {
        if (p.inds) {
            this.experimentProcessesService.addProcessToDataset(p, this.dataset, this.datasetProcesses);
            this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [p.id], []).then(
                () => null,
                () => this.toast.error(`Unable to add process to dataset ${p.name}`)
            );
        } else {
            this.experimentProcessesService.removeProcessFromDataset(p, this.dataset, this.datasetProcesses);
            this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [], [p.id]).then(
                () => null,
                () => this.toast.error(`Unable to remove process from dataset ${p.name}`)
            );
        }
    }
}

class MCProcessesWorkflowOutlineDirDirectiveController {
    /*@ngInject*/
    constructor(datasetService, $stateParams, toast, experimentProcessesService) {
        this.datasetProcesses = this.mcProcessesWorkflowOutline.datasetProcesses;
        this.datasetService = datasetService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.experimentProcessesService = experimentProcessesService;
    }

    showDetails(p) {
        this.mcProcessesWorkflowOutline.showDetails(p);
    }

    toggle(p) {
        if (p.inds) {
            this.experimentProcessesService.addProcessToDataset(p, this.dataset, this.datasetProcesses);
            this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [p.id], []).then(
                () => null,
                () => this.toast.error(`Unable to add process to dataset ${p.name}`)
            );
        } else {
            this.experimentProcessesService.removeProcessFromDataset(p, this.dataset, this.datasetProcesses);
            this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [], [p.id]).then(
                () => null,
                () => this.toast.error(`Unable to remove process from dataset ${p.name}`)
            );
        }
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
        templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow-outline-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function() {});
        }
    }
}

angular.module('materialscommons').directive('mcProcessesWorkflowOutlineDir', mcProcessesWorkflowOutlineDirDirective);

angular.module('materialscommons').component('mcProcessesWorkflowOutline', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-processes-workflow-outline.html',
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
