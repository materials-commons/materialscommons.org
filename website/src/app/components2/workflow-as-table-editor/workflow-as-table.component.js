class MCWorkflowAsTableComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.state = {
            samples: [],
            headers: [],
            editTable: false,
            samplesMarked: false,
        }
    }

    $onInit() {

    }

    editSample(sample) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/edit-sample-dialog.html',
            controller: EditSampleDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                sample: sample
            }
        });
    }

    $onChanges(changes) {
        this.state.samplesMarked = false;
        if (changes.samples) {
            this.state.samples = angular.copy(changes.samples.currentValue);
        }

        if (changes.headers) {
            this.state.headers = angular.copy(changes.headers.currentValue);
        }

        if (changes.editTable) {
            this.state.editTable = changes.editTable.currentValue;
        }

        this.markSampleHeaders();
        this.state.samplesMarked = true;
    }

    markSampleHeaders() {
        this.state.samples.filter(s => s.process_type !== 'create').forEach(s => {
            let headers = angular.copy(this.state.headers);
            s.headers = headers.map(h => {
                h.use = false;
                return h;
            });
            s.processes.forEach(p => {
                for (let i = 0; i < s.headers.length; i++) {
                    let headerToCheck = s.headers[i];
                    let index = _.findIndex(headerToCheck.processes, pid => pid == p.id);
                    if (index !== -1) {
                        headerToCheck.use = true;
                        break;
                    }
                }
            });
        });
    }

    editProcess(process, sample) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/edit-sample-process-dialog.html',
            controller: EditSampleProcessDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                sample: sample,
                process: process
            }
        });
    }

    handleDeleteColumnClick(index) {
        this.onDeleteProcess({index: index});
    }

    handleSampleProcessChange(sampleIndex, processIndex, selected) {
        this.onSampleProcessChange({sampleIndex: sampleIndex, processIndex: processIndex, state: selected});
    }

    handleSampleSelection(index, selectState) {
        this.onSampleSelected({sampleIndex: index, selectState: selectState});
    }
}

angular.module('materialscommons').component('mcWorkflowAsTable', {
    template: require('./workflow-as-table.html'),
    controller: MCWorkflowAsTableComponentController,
    bindings: {
        samples: '<',
        headers: '<',
        editTable: '<',
        onDeleteProcess: '&',
        onSampleSelected: '&',
        onSampleProcessChange: '&',
    }
});

class EditSampleDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.headers = [
            "Heat Treatment",
            "SEM",
            "Low Cycle Fatigue",
            "EBSD",
            "TEM",
            "Cogging",
            "TEM",
        ];

        this.files = [
            {
                selected: false,
                name: 'hardeningdata.xls',
                path: 'project1/hardening tests',
                samples: 'E1XKG'
            },
            {
                selected: false,
                name: 'crack.tiff',
                path: 'project1/hardening tests',
                samples: 'S1XKG'
            },
            {
                selected: false,
                name: 'sem.odg',
                path: 'project1/sem runs/hardening',
                samples: 'S1XKG_400'
            },
            {
                selected: false,
                name: 'sem graphs.xls',
                path: 'project1/sem runs/hardening',
                samples: 'S1XKG_400'
            },
            {
                selected: false,
                name: 'final_results.xls',
                path: 'project1/hardening tests/results',
                samples: 'S1XKG, S1XKG_400'
            },
        ];
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class EditSampleProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}