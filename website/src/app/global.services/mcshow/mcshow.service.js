class MCShowService {
    /*@ngInject*/
    constructor($mdDialog, mcprojectstore2) {
        this.$mdDialog = $mdDialog;
        this.mcprojecstore = mcprojectstore2;
    }

    sampleDialog(sample, multiple = true) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/show-sample-dialog.html',
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
            templateUrl: 'app/modals/mc-process-details-dialog.html',
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
            templateUrl: 'app/modals/process-details-dialog-ro.html',
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
            templateUrl: 'app/modals/project-overview-dialog.html',
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
            templateUrl: 'app/modals/show-file-dialog.html',
            controllerAs: '$ctrl',
            controller: CommonDoneDismissDialogController,
            bindToController: true,
            multiple: multiple,
            locals: {
                file: file
            }
        });
    }

    chooseSamplesFromProject() {
        const proj = this.mcprojecstore.getCurrentProject();
        // console.log('proj', proj);
        let fillRandomProcesses = (count) => {
            let processes = [];
            for (let i = 0; i < count; i++) {
                let rval = Math.floor(Math.random() * 2);
                if (rval) {
                    processes.push({active: true, selected: true});
                } else {
                    processes.push({active: false, selected: false});
                }
            }
            return processes;
        };

        let existingSamples = angular.copy(proj.samples);
        existingSamples.forEach(s => {
            s.selected = false;
            s.processes = fillRandomProcesses(11);
        });

        return this.$mdDialog.show({
            templateUrl: 'app/modals/choose-existing-samples-dialog.html',
            controller: ChooseExistingSamplesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                samples: existingSamples
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

class ChooseExistingSamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.state = {
            samples: angular.copy(this.samples)
        }
    }

    done() {
        let chosenSamples = this.state.samples.filter(s => s.selected).map(s => {
            // Reset selected flag so we return the samples in the same
            // state we received them.
            s.selected = false;
            return s;
        });
        this.$mdDialog.hide(chosenSamples);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('mcshow', MCShowService);