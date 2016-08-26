class MCWorkflowProcessesComponentController {
    /*@ngInit*/
    constructor() {
        this.processTypes = [
            {
                title: 'TRANSFORMATION',
                cssClass: 'mc-transform-color',
                icon: 'fa-exclamation-triangle',
                processes: [
                    {
                        title: 'Heat Treatment'
                    },
                    {
                        title: 'Ultrasonic Fatigue'
                    },
                    {
                        title: 'Cogging'
                    }
                ]
            },
            {
                title: 'MEASUREMENT',
                cssClass: 'mc-measurement-color',
                icon: 'fa-circle',
                processes: [
                    {
                        title: 'SEM'
                    },
                    {
                        title: 'APT'
                    }
                ]
            },
            {
                title: 'ANALYSIS',
                cssClass: 'mc-analysis-color',
                icon: 'fa-square',
                processes: [
                    {
                        title: 'Graph it!'
                    },
                    {
                        title: 'Plot it!'
                    }
                ]
            }
        ]
    }
}

angular.module('materialscommons').component('mcWorkflowProcesses', {
    templateUrl: 'app/global.components/graph/mc-workflow-processes.html',
    controller: MCWorkflowProcessesComponentController
});
