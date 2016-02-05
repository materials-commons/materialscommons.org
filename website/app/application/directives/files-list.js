(function(module) {
    module.directive('filesList', filesListDirective);
    function filesListDirective() {
        return {
            restrict: 'E',
            scope: {
                files: '='
            },
            templateUrl: 'application/directives/partials/files-list.html'
        };
    }
}(angular.module('materialscommons')));

