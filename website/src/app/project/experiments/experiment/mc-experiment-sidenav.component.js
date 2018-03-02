class MCExperimentSidenavComponentController {
    /*@ngInject*/
    constructor($state, $mdDialog) {
        this.$state = $state;
        this.$mdDialog = $mdDialog;
    }

    openExperimentsList() {
        this.$mdDialog.show({
            templateUrl: 'app/project/experiments/experiment/list-experiments-dialog.html',
            controller: SelectExperimentDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        })
    }
}

class SelectExperimentDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.done();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcExperimentSidenav', {
    template: require('./mc-experiment-sidenav.html'),
    controller: MCExperimentSidenavComponentController
});
