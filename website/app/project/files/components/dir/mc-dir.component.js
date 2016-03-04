(function(module) {
    module.component('mcDir', {
        templateUrl: 'project/files/components/dir/mc-dir.html',
        controller: 'MCDirComponentController'
    });

    module.controller('MCDirComponentController', MCDirComponentController);
    MCDirComponentController.$inject = ["$stateParams", "project", "gridFiles"];
    function MCDirComponentController($stateParams, project, gridFiles) {
        var ctrl = this;
        ctrl.project = project.get();

        var entry = gridFiles.findEntry(ctrl.project.files[0], $stateParams.dir_id);
        if (entry) {
            ctrl.dir = entry.model;
        }
    }
}(angular.module('materialscommons')));
