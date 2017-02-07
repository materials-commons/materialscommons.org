class WorkflowService {
    /*@ngInject*/
    constructor(experimentsService, mcbus, templates, toast, $mdDialog) {
        this.experimentsService = experimentsService;
        this.mcbus = mcbus;
        this.templates = templates;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
    }

    addProcessFromTemplate(templateId, projectId, experimentId) {
        this.experimentsService.createProcessFromTemplate(projectId, experimentId, `global_${templateId}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.$mdDialog.show({
                        templateUrl: 'app/project/experiments/experiment/components/workflow/new-process-dialog.html',
                        controllerAs: '$ctrl',
                        controller: NewProcessDialogController,
                        bindToController: true,
                        multiple: true,
                        locals: {
                            process: p
                        }
                    }).then(
                        () => {
                            this.experimentsService.getProcessesForExperiment(projectId, experimentId)
                                .then(
                                    (processes) => {
                                        this.processes = processes;
                                        this.mcbus.send('PROCESSES$CHANGE', processes);
                                    },
                                    () => this.toast.error('Error retrieving processes for experiment')
                                );
                        }
                    );
                },
                () => this.toast.error('Unable to add samples')
            );
    }


    // deleteProcess(processId) {
    //
    // }
    //
    // selectProcess() {
    //
    // }
}

class NewProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog, processesService, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.processesService = processesService;
        this.projectId = $stateParams.project_id;
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

angular.module('materialscommons').service('workflowService2', WorkflowService);