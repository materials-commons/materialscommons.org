(function(module) {
    module.directive('samplesList', samplesListDirective);
    function samplesListDirective() {
        return {
            restrict: 'E',
            scope: {
                samples: '='
            },
            //controller: 'DetailTabsDirectiveController',
            //controllerAs: 'ctrl',
            //bindToController: true,
            templateUrl: 'application/directives/partials/samples-list.html'
        };
    }
}(angular.module('materialscommons')));

