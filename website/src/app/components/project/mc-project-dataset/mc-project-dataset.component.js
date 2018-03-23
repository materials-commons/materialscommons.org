class MCProjectDatasetComponentController {
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
}

angular.module('materialscommons').component('mcProjectDataset', {
    template: require('./mc-project-dataset.html'),
    controller: MCProjectDatasetComponentController
});