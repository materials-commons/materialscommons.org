class MCShowService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    sampleDialog(sample, multiple = true) {
        return this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-sample-dialog.html',
            controllerAs: '$ctrl',
            controller: CommonDoneDismissDialogController,
            bindToController: true,
            multiple: multiple,
            locals: {
                sample: sample
            }
        });
    }

    processDetailsDialog(process, multiple = true) {
        return this.$mdDialog.show({
                templateUrl: 'app/project/experiments/experiment/components/workflow/mc-process-details-dialog.html',
                controller: MCProcessDetailsDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                multiple: multiple,
                locals: {
                    process: process
                }
            });
    }

    processDetailsDialogRO(process, multiple = true) {
        this.$mdDialog.show({
            templateUrl: 'app/global.services/mcshow/process-details-dialog-ro.html',
            controller: CommonDoneDismissDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: multiple,
            locals: {
                process: process
            }
        });
    }

    projectOverviewDialog(project, multiple = true) {
        this.$mdDialog.show({
            templateUrl: 'app/global.services/mcshow/partials/project-overview-dialog.html',
            controller: CommonDoneDismissDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: multiple,
            locals: {
                project: project
            }
        });
    }

    showFile(file, multiple = true) {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/components/dataset/components/show-file-dialog.html',
            controllerAs: '$ctrl',
            controller: CommonDoneDismissDialogController,
            bindToController: true,
            multiple: multiple,
            locals: {
                file: file
            }
        });
    }
}

class CommonDoneDismissDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}

class MCProcessDetailsDialogController {
    /*@ngInject*/
    constructor($mdDialog, workflowService, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.workflowService = workflowService;
    }

    done() {
        this.$mdDialog.hide(this.process);
    }

    deleteProcess() {
        this.workflowService.deleteNodeAndProcess(this.projectId, this.experimentId, this.process.id)
    }
}

angular.module('materialscommons').service('mcshow', MCShowService);