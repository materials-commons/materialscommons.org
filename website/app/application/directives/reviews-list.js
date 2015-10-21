(function(module) {
    module.directive('reviewsList', reviewsListDirective);
    function reviewsListDirective() {
        return {
            restrict: 'E',
            scope: {
                reviews: '='
            },
            //controller: 'DetailTabsDirectiveController',
            //controllerAs: 'ctrl',
            //bindToController: true,
            templateUrl: 'application/directives/partials/reviews-list.html'
        };
    }
}(angular.module('materialscommons')));

