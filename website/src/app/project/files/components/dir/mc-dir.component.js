angular.module('materialscommons').component('mcDir', {
    templateUrl: 'app/project/files/components/dir/mc-dir.html',
    controller: MCDirComponentController
});

function MCDirComponentController($stateParams, mcstate, gridFiles) {
    'ngInject';

    const ctrl = this;
    ctrl.project = mcstate.get(mcstate.CURRENT$PROJECT);

    const entry = gridFiles.findEntry(ctrl.project.files[0], $stateParams.dir_id);
    if (entry) {
        ctrl.dir = entry.model;
    }
}