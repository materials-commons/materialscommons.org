Application.Directives.directive('conditionReport',
    function () {
        return {
            restrict: "A",
            scope: {
                item: '='
            },
            templateUrl: 'application/directives/condition-report.html'
        };
    });
