Application.Directives.directive('iterateProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                allProperties: '=',
                edit: '='
            },
            templateUrl: 'application/directives/iterate-properties.html'
        };
    });
