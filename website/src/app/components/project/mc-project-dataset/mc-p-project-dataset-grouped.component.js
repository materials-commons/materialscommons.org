class MCPProjectDatasetGroupedComponentController {
    /*@ngInject*/
    constructor() {
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
}

angular.module('materialscommons').component('mcPProjectDatasetGrouped', {
    template: require('./mc-p-project-dataset-grouped.html'),
    controller: MCPProjectDatasetGroupedComponentController
});