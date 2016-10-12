class MCExperimentSidenavComponentController {
    /*@ngInject*/
    constructor($state) {
        this.$state = $state;
    }
}

angular.module('materialscommons').component('mcExperimentSidenav', {
    templateUrl: 'app/project/experiments/experiment/mc-experiment-sidenav.html',
    controller: MCExperimentSidenavComponentController
});
