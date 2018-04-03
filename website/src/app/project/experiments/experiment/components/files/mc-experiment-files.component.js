angular.module('materialscommons').component('mcExperimentFiles', {
    template: require('./mc-experiment-files.html'),
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

