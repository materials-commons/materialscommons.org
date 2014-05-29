Application.Directives.directive('iterateProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                allProperties: '='
            },
            templateUrl: 'application/directives/iterate-properties.html'
        };
    });
