(function(module) {
    module.directive('reviewsList', reviewsListDirective);
    function reviewsListDirective() {
        return {
            restrict: 'E',
            scope: {
                reviews: '='
            },
            templateUrl: 'application/directives/partials/reviews-list.html'
        };
    }
}(angular.module('materialscommons')));

