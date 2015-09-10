(function (module) {
    module.controller("FilesSearchController", FilesSearchController);

    FilesSearchController.$inject = ["$state"];

    /* @ngInject */
    function FilesSearchController($state) {
        var ctrl = this;
        ctrl.showResults = showResults;

        /////////////////
        function showResults() {
            $state.go('projects.project.files.search');
        }
    }

}(angular.module('materialscommons')));
