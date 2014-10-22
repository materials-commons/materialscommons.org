Application.Controllers.controller("homeSamplesController",
    ["$scope", "$filter", function ($scope, $filter) {

        function init() {
        }

        init();
    }]);
Application.Directives.directive('homeSamples',
    function () {
        return {
            restrict: "A",
            controller: 'homeSamplesController',
            scope: {
                project: '=project'
            },
            templateUrl: 'application/directives/home-samples.html'
        };
    });