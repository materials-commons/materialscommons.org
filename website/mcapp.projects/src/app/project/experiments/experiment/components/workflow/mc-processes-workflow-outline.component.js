class MCProcessesWorkflowOutlineComponentController {
    /*@ngInject*/
    constructor(processTree, datasetsAPI, experimentsAPI, $stateParams, toast, workflowService,
                experimentProcessesService, mcbus, mcstate, workflowState) {
        this.processTree = processTree;
        this.datasetsAPI = datasetsAPI;
        this.experimentsAPI = experimentsAPI;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.datasetId = $stateParams.dataset_id;
        this.toast = toast;
        this.myName = 'mcProcessesWorkflowOutline';
        this.workflowService = workflowService;
        this.experimentProcessesService = experimentProcessesService;
        this.mcbus = mcbus;
        this.workflowState = workflowState;
        this.workflowState.setDataset(this.dataset);
        this.mcstate = mcstate;
    }

    $onInit() {
        // To preserve this binding pass this.allProcessesGraph bound to an arrow function. Arrow
        // functions lexically scope, so this in the arrow function is the this for
        // MCProcessGraphOutlineComponentController
        let cb = (processes) => {
            this.processes = processes;
            this.buildOutline();
        };

        this.datasetProcesses = this.workflowState.datasetProcesses;

        this.mcstate.subscribe('WORKSPACE$MAXIMIZED', this.myName, (maximized) => {
            this.sidebarShowing = !maximized;
        });

        this.mcbus.subscribe('PROCESSES$CHANGE', this.myName, cb);
        this.buildOutline();
    }

    $onDestroy() {
        this.mcbus.leave('PROCESSES$CHANGE', this.myName);
        this.mcstate.leave('WORKSPACE$MAXIMIZED', this.myName)
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

    focusOn(process) {
        this.mcbus.send('WORKFLOW$HIDEOTHERS', process);
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
        this.experimentsAPI.getProcessForExperiment(this.projectId, this.experimentId, p.id).then(
            process => {
                this.process = process;
                process.hasChildren = p.children.length;
                this.workflowState.setSelectedProcess(process);
            }
        );
        //this.mcProcessesWorkflow.setSelectedProcess(p.id, p.children.length !== 0);
    }

    toggle(p) {
        if (p.inds) {
            this.experimentProcessesService.addProcessToDataset(p, this.dataset, this.datasetProcesses);
            this.datasetsAPI.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [p.id], []).then(
                () => null,
                () => this.toast.error(`Unable to add process to dataset ${p.name}`)
            );
        } else {
            this.experimentProcessesService.removeProcessFromDataset(p, this.dataset, this.datasetProcesses);
            this.datasetsAPI.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [], [p.id]).then(
                () => null,
                () => this.toast.error(`Unable to remove process from dataset ${p.name}`)
            );
        }
    }

    deleteProcess() {
        this.workflowService.deleteNodeAndProcess(this.projectId, this.experimentId, this.process.id)
    }
}

class MCProcessesWorkflowOutlineDirDirectiveController {
    /*@ngInject*/
    constructor(datasetsAPI, $stateParams, toast, experimentProcessesService) {
        this.datasetProcesses = this.mcProcessesWorkflowOutline.datasetProcesses;
        this.datasetsAPI = datasetsAPI;
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
            this.datasetsAPI.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [p.id], []).then(
                () => null,
                () => this.toast.error(`Unable to add process to dataset ${p.name}`)
            );
        } else {
            this.experimentProcessesService.removeProcessFromDataset(p, this.dataset, this.datasetProcesses);
            this.datasetsAPI.updateProcessesInDataset(this.projectId, this.experimentId, this.datasetId, [], [p.id]).then(
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
        compile: function (element) {
            return RecursionHelper.compile(element, function () {
            });
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
    }
});
