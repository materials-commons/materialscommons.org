Application.Controllers.controller('ReviewController',
    ["$scope", "mcapi", "User", "dateGenerate","$state", function ($scope, mcapi, User, dateGenerate, $state) {

    }]);

Application.Directives.directive('review',
    function () {
        return {
            restrict: "A",
            controller: "ReviewController",
            scope: {
                edit: "=",
                doc: '=',
                type: '@',
                update: '@',
                message: '='
            },
            templateUrl: 'application/directives/review.html'
        };
    });