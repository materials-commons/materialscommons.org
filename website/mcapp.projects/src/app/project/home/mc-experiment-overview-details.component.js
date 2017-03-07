class MCExperimentOverviewDetailsComponentController {
    /*@ngInject*/
    constructor() {
        this.options = {
            data: {
                type: 'donut',
                columns: [
                    ['unused', 5], ['used', 8]
                ]
            },
            donut: {
                title: 'Samples',
                label: {
                    format: function (value) {
                        return value;
                    }
                },
                width: 35
            }
        }
    }
}

angular.module('materialscommons').component('mcExperimentOverviewDetails', {
    templateUrl: 'app/project/home/mc-experiment-overview-details.html',
    controller: MCExperimentOverviewDetailsComponentController,
    bindings: {
        experiment: '<'
    }
});
