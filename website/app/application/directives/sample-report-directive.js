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

    $scope.refreshProjects = function () {
        mcapi('/samples/project/%', $scope.sample.id)
            .success(function (data) {
                $scope.projects_by_sample = data;
            }).jsonp();
    };

    function init(){
        $scope.refreshProjects();
    }
    init();
}
