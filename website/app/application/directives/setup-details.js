(function(module) {
    module.directive('setupDetails', setupDetailsDirective);
    function setupDetailsDirective() {
        return {
            restrict: 'E',
            scope: {
                setup: '='
            },
            //controller: 'DetailTabsDirectiveController',
            //controllerAs: 'ctrl',
            //bindToController: true,
            templateUrl: 'application/directives/partials/setup-details.html'
        };
    }
}(angular.module('materialscommons')));
