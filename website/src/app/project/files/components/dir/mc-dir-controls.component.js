angular.module('materialscommons').component('mcDirControls', {
    templateUrl: 'app/project/files/components/dir/mc-dir-controls.html',
    controller: MCDirControlsComponentController,
    bindings: {
        dir: '='
    }
});

function MCDirControlsComponentController(projectsService, $stateParams, pubsub) {
    'ngInject';

    var ctrl = this;
    ctrl.createDirActive = false;
    ctrl.createDir = createDir;
    ctrl.dirPath = '';

    ///////////////////////

    function createDir() {
        if (ctrl.dirPath !== '') {
            ctrl.createDirActive = false;
            projectsService.createProjectDir($stateParams.project_id, $stateParams.dir_id, ctrl.dirPath)
                .then(function() {
                    pubsub.send('files.dir.refresh', $stateParams.dir_id);
                });
        }
    }
}