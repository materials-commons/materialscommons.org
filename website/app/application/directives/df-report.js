Application.Directives.directive('dfReport',
    function () {
        return {
            restrict: "A",
            scope: {
                defaultProperties: '=',
                machinesList: '='
            },
            templateUrl: 'application/directives/default-properties-report.html'
        };
    });
