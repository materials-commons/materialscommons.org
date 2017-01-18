angular.module('materialscommons').component('mcDir', {
    templateUrl: 'app/project/files/components/dir/mc-dir.html',
    controller: MCDirComponentController
});

function MCDirComponentController($stateParams, mcreg, gridFiles) {
    'ngInject';

    const ctrl = this;
    ctrl.project = mcreg.current$project;

    const entry = gridFiles.findEntry(ctrl.project.files[0], $stateParams.dir_id);
    if (entry) {
        ctrl.dir = entry.model;
    }
}