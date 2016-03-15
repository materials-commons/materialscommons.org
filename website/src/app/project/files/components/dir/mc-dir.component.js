angular.module('materialscommons').component('mcDir', {
    templateUrl: 'app/project/files/components/dir/mc-dir.html',
    controller: MCDirComponentController
});

function MCDirComponentController($stateParams, project, gridFiles) {
    'ngInject';

    var ctrl = this;
    ctrl.project = project.get();

    var entry = gridFiles.findEntry(ctrl.project.files[0], $stateParams.dir_id);
    if (entry) {
        ctrl.dir = entry.model;
    }
}