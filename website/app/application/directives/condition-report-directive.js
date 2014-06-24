Application.Directives.directive('conditionReport',
    function () {
        return {
            restrict: "A",
            scope: {
                condition: '='
            },
            templateUrl: 'application/directives/condition-report.html'
        };
    });
