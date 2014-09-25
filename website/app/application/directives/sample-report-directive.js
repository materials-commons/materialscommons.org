Application.Directives.directive('sampleReport',
    function () {
        return {
            controller: 'actionSampleReportController',
            restrict: "A",
            scope: {
                sample: '='
            },
            templateUrl: 'application/directives/sample-report.html'
        };
    });

Application.Controllers.controller('actionSampleReportController',
    ["$scope", "mcapi",  actionSamplesController]);

function actionSamplesController($scope, mcapi) {

}
