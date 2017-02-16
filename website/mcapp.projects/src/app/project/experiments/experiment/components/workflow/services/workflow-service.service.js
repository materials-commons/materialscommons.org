class WorkflowService {
    /*@ngInject*/
    constructor(experimentsService, processesService, mcbus, templates, toast, $mdDialog) {
        this.experimentsService = experimentsService;
        this.processesService = processesService;
        this.mcbus = mcbus;
        this.templates = templates;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
    }

    addProcessFromTemplate(templateId, projectId, experimentId, multiple = true) {
        this.experimentsService.createProcessFromTemplate(projectId, experimentId, `global_${templateId}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.$mdDialog.show({
                        templateUrl: 'app/project/experiments/experiment/components/workflow/new-process-dialog.html',
                        controllerAs: '$ctrl',
                        controller: NewProcessDialogController,
                        bindToController: true,
                        multiple: multiple,
                        locals: {
                            process: p
                        }
                    }).then(
                        () => this.sendProcessChangeEvent(projectId, experimentId)
                    );
                },
                () => this.toast.error('Unable to add samples')
            );
    }

    cloneProcess(projectId, experimentId, process) {
        let p = angular.copy(process);
        p.input_samples.forEach(s => s.selected = true);
        p.output_samples.forEach(s => s.selected = true);
        p.files.forEach(f => f.selected = true);
        return this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/workflow/services/clone-process-dialog.html',
            controllerAs: '$ctrl',
            controller: CloneProcessDialogController,
            bindToController: true,
            locals: {
                process: p
            }
        }).then(
            (cloneArgs) => {
                return this.experimentsService.cloneProcess(projectId, experimentId, p.id, cloneArgs).then(
                    () => this.sendProcessChangeEvent(projectId, experimentId),
                    () => this.toast.error('Error cloning process')
                )
            }
        );
    }

    sendProcessChangeEvent(projectId, experimentId) {
        this.experimentsService.getProcessesForExperiment(projectId, experimentId)
            .then(
                (processes) => this.mcbus.send('PROCESSES$CHANGE', processes),
                () => this.toast.error('Error retrieving processes for experiment')
            );
    }

    deleteNodeAndProcess(projectId, experimentId, processId) {
        this.processesService.getDeleteProcessPreConditions(projectId, processId)
            .then(
                process => {
                    let numberOfSamples = process.output_samples.length;
                    if (numberOfSamples == 0) {
                        this.deleteNodeAndProcess();
                    } else {
                        this.confirmAndDeleteProcess(projectId, experimentId, process);
                    }
                },
                error => this.toast.error(error.data.error)
            );
    }

    confirmAndDeleteProcess(projectId, experimentId, process) {
        let processName = process.name;
        let numberOfSamples = process.output_samples.length;
        let samples = " output sample" + ((numberOfSamples != 1) ? "s" : "");
        let processInfo = processName + " - has " + numberOfSamples + samples + ".";
        let confirm = this.$mdDialog.confirm()
            .title('This process has output samples: Delete node and Samples?')
            .textContent(processInfo)
            .ariaLabel('Please confirm - deleting node')
            .ok('Delete')
            .cancel('Cancel');

        this.$mdDialog.show(confirm).then(() => this.deleteNodeAndProcess(projectId, experimentId, process.id));
    }

    deleteNodeAndProcess(projectId, experimentId, processId) {
        //NOTE: currently the graph is redisplayed after the process is deleted;
        // so, currently we do not delete the node from the graph itself; the problem
        // with this approach is that redrawing the graph "blows away"
        // any local layout that the user has created. Hence, this needs to be
        // updated so that only the process is deleted, and the node is deleted
        // from the graph without disturbing the layout. Terry Weymouth - Sept 29, 2016
        this.processesService.deleteProcess(projectId, processId)
            .then(
                () => {
                    this.experimentsService.getProcessesForExperiment(projectId, experimentId)
                        .then(
                            (processes) => {
                                this.mcbus.send('PROCESSES$CHANGE', processes);
                            },
                            () => this.toast.error('Error retrieving processes for experiment')
                        );
                },

                error => this.toast.error(error.data.error)
            );
    }
}

class NewProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog, processesService, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.processesService = processesService;
        this.projectId = $stateParams.project_id;
        this.processName = this.process.name;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.processesService.deleteProcess(this.projectId, this.process.id).then(
            () => this.$mdDialog.cancel(),
            () => this.$mdDialog.cancel()
        );
    }
}

class CloneProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        let files = this.process.files.filter(f => f.selected);
        let inputSamples = this.process.input_samples.filter(s => s.selected);
        this.$mdDialog.hide({name: this.process.name, files: files, samples: inputSamples});
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('workflowService', WorkflowService);