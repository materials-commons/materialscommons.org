Application.Controllers.controller("homeProvenanceController",
    ["$scope",  function ($scope) {

        function init() {

        }

        init();
    }]);
Application.Directives.directive('homeProvenance',
    function () {
        return {
            restrict: "A",
            controller: 'homeProvenanceController',
            scope: {
                project: '=project'
            },
            templateUrl: 'application/directives/home-provenance.html'
        };
    });