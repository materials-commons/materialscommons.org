function addProcessToDataset(p, dataset, datasetProcesses) {
    p.inds = true;
    p.highlight = true;
    datasetProcesses[p.id] = p;
    dataset.processes.push(p);
}

function removeProcesssFromDataset(p, dataset, datasetProcesses) {
    p.inds = false;
    p.highlight = false;
    delete datasetProcesses[p.id];
    let i = _.findIndex(dataset.processes, (proc) => proc.id === p.id);
    if (i !== -1) {
        dataset.processes.splice(i, 1);
    }
}


class MCProcessesWorkflowOutlineComponentController {
    /*@ngInject*/
    constructor(processTree, datasetService, $stateParams, toast) {
        this.processTree = processTree;
        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
        this.datasetService = datasetService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
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
        if (this.dataset) {
            this.root.walk((node) => {
                node.model.inds = !!(node.model.id in this.datasetProcesses);
            });
        }
    }

    showDetails(p) {
        this.processTree.clearSelected(this.root);
        p.selected = true;
        this.mcProcessesWorkflow.setSelectedProcess(p.id, p.children.length !== 0);
    }

    toggle(p) {
        if (p.inds) {
            addProcessToDataset(p, this.dataset, this.datasetProcesses);
            this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [p.id], []).then(
                () => null,
                () => this.toast.error(`Unable to add process to dataset ${p.name}`)
            );
        } else {
            removeProcesssFromDataset(p, this.dataset, this.datasetProcesses);
            this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [], [p.id]).then(
                () => null,
                () => this.toast.error(`Unable to remove process from dataset ${p.name}`)
            );
        }
    }
}

class MCProcessesWorkflowOutlineDirDirectiveController {
    /*@ngInject*/
    constructor(datasetService, $stateParams, toast) {
        this.datasetProcesses = this.dataset ? _.indexBy(this.dataset.processes, 'id') : {};
        this.datasetService = datasetService;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
    }

    showDetails(p) {
        this.mcProcessesWorkflowOutline.showDetails(p);
    }

    toggle(p) {
        if (p.inds) {
            addProcessToDataset(p, this.dataset, this.datasetProcesses);
            this.datasetService.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [p.id], []).then(
                () => null,
                () => this.toast.error(`Unable to add process to dataset ${p.name}`)
            );
        } else {
            removeProcesssFromDataset(p, this.dataset, this.datasetProcesses);
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
