Application.Directives.directive('sampleReport',
    function () {
        return {
            restrict: "A",
            scope: {
                sample: '='
            },
            templateUrl: 'application/directives/sample-report.html'
        };
    });
