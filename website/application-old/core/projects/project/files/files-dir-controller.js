(function (module) {
    module.controller('DirController', DirController);
    DirController.$inject = ['$stateParams', 'project', 'gridFiles'];

    /* @ngInject */
    function DirController($stateParams, project, gridFiles) {
        var ctrl = this;

        var entry = gridFiles.findEntry(project.files[0], $stateParams.dir_id);
        if (entry) {
            ctrl.dir = entry.model;
        }
        ctrl.project = project;
    }
}(angular.module('materialscommons')));
