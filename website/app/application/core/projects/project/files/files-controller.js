(function (module) {
    module.controller("FilesController", FilesController);

    FilesController.$inject = ["$state"];

    /* @ngInject */
    function FilesController($state) {
        var ctrl = this;

        ctrl.showSearchResults = showSearchResults;

        //////////////////
        function showSearchResults() {
            $state.go('projects.project.files.search');
        }
    }
}(angular.module('materialscommons')));
