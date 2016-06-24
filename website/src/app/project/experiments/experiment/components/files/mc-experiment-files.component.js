angular.module('materialscommons').component('mcExperimentFiles', {
    templateUrl: 'app/project/experiment/experiment/components/files/mc-experiment-files.html',
    controller: MCExperimentFilesComponentController,
    bindings: {
        files: '='
    }
});

/*@ngInject*/
function MCExperimentFilesComponentController() {
    var ctrl = this;
    ctrl.query = '';
    ctrl.showTableView = true;
}

