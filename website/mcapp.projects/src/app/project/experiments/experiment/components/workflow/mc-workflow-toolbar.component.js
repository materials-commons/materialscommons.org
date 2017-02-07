class MCWorkflowToolbarComponentController {
    /*@ngInject*/
    constructor(workflowService, $timeout, $mdDialog) {
        this.myName = "mcWorkflowToolbar";
        this.workflowService = workflowService;
        this.$timeout = $timeout;
        this.selectedProcess = null;
        this.$mdDialog = $mdDialog;
    }


    $onInit() {
        let cb = (selected) => this.$timeout(() => this.selectedProcess = selected);
        this.workflowService.addOnSelectCallback(this.myName, cb);
    }

    $onDestroy() {
        this.workflowService.deleteOnSelectCallback(this.myName);
    }

    addProcess() {
        console.log('addProcess');
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/workflow/mc-process-templates-dialog.html',
            controller: SelectProcessTemplateDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: true
        });
    }


}

class SelectProcessTemplateDialogController {
    /*@ngInject*/
    constructor($mdDialog, $stateParams, experimentsService, mcbus, templates) {
        this.$mdDialog = $mdDialog;
        this.experimentsService = experimentsService;
        this.mcbus = mcbus;
        this.templates = templates;

        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
    }

    addSelectedProcessTemplate(templateId) {
        this.experimentsService.createProcessFromTemplate(this.projectId, this.experimentId, `global_${templateId}`)
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
                            this.experimentsService.getProcessesForExperiment(this.projectId, this.experimentId)
                                .then(
                                    (processes) => {
                                        this.processes = processes;
                                        //this.addProcessCallback(processes);
                                        this.mcbus.send('ADD$PROCESS', processes);
                                    },
                                    () => this.toast.error('Error retrieving processes for experiment')
                                );
                        }
                    );
                },
                () => this.toast.error('Unable to add samples')
            );
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
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

angular.module('materialscommons').component('mcWorkflowToolbar', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-workflow-toolbar.html',
    controller: MCWorkflowToolbarComponentController
});
