(function(module) {
    module.directive('filesList', filesListDirective);
    function filesListDirective() {
        return {
            restrict: 'E',
            scope: {
                files: '='
            },
            //controller: 'DetailTabsDirectiveController',
            //controllerAs: 'ctrl',
            //bindToController: true,
            templateUrl: 'application/directives/partials/files-list.html'
        };
    }
}(angular.module('materialscommons')));

