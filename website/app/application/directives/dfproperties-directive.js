Application.Directives.directive('dfProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                defaultProperties: '='
            },
            templateUrl: 'application/directives/default-properties.html'
        };
    });
