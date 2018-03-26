class MCPProjectDatasetUngroupedComponentController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;

        this.headers = [
            "Heat Treatment",
            "Heat Treatment",
            "SEM",
            "SEM",
            "Low Cycle Fatigue",
            "EBSD",
            "EBSD",
            "Tension",
            "EBSD",
            "TEM",
            "TEM",
            "TEM",
            "Cogging",
            "Cogging",
            "Cogging",
            "Tension",
            "EBSD",
            "TEM",
            "Cogging",
            "Tension",
            "EBSD",
            "TEM",
        ];

        this.samples = [];
        for (let i = 0; i < 10; i++) {
            this.samples.push({
                selected: false,
                name: "Sample_" + i,
                processes: this.fillRandomProcesses(this.headers.length)
            })
        }
    }

    fillRandomProcesses(count) {
        let processes = [];
        for (let i = 0; i < count; i++) {
            let rval = Math.floor(Math.random() * 2);
            if (rval) {
                processes.push(true);
            } else {
                processes.push(false);
            }
        }
        return processes;
    }

    editSample(sample) {
        this.$mdDialog.show({
            templateUrl: 'app/components/project/mc-project-dataset/edit-sample-dialog.html',
            controller: EditSampleDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                sample: sample
            }
        });
    }

    editProcess(process, sample) {
        this.$mdDialog.show({
            templateUrl: 'app/components/project/mc-project-dataset/edit-sample-process-dialog.html',
            controller: EditSampleProcessDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                sample: sample,
                process: process
            }
        });
    }
}

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

angular.module('materialscommons').component('mcPProjectDatasetUngrouped', {
    template: require('./mc-p-project-dataset-ungrouped.html'),
    controller: MCPProjectDatasetUngroupedComponentController
});