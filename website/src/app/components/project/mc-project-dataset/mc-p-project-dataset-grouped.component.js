class MCPProjectDatasetGroupedComponentController {
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

        this.samples = [
            {
                selected: false,
                name: "Sample_1, Sample_2, ...",
                processes: this.fillRandomProcesses(this.headers.length)
            },

            {
                selected: false,
                name: "Sample_8, Sample_ab, ...",
                processes: this.fillRandomProcesses(this.headers.length)
            },

            {
                selected: false,
                name: "EX1, EZ3, ...",
                processes: this.fillRandomProcesses(this.headers.length)
            },
        ];
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

    editGroupedProcess(process) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/edit-grouped-sample-process-dialog.html',
            controller: EditGroupedSampleProcessDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                process: process
            }
        });
    }
}

class EditGroupedSampleProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;

        this.files = [
            {
                selected: false,
                name: 'hardeningdata.xls',
                path: 'project1/hardening tests',
                samples: 'Sample_1'
            },
            {
                selected: false,
                name: 'crack.tiff',
                path: 'project1/hardening tests',
                samples: 'Sample_1'
            },
            {
                selected: false,
                name: 'sem.odg',
                path: 'project1/sem runs/hardening',
                samples: 'Sample_2'
            },
            {
                selected: false,
                name: 'sem graphs.xls',
                path: 'project1/sem runs/hardening',
                samples: 'Sample_2'
            },
            {
                selected: false,
                name: 'final_results.xls',
                path: 'project1/hardening tests/results',
                samples: 'Sample_3'
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

angular.module('materialscommons').component('mcPProjectDatasetGrouped', {
    template: require('./mc-p-project-dataset-grouped.html'),
    controller: MCPProjectDatasetGroupedComponentController
});
