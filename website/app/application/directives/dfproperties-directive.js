Application.Directives.directive('dfProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                defaultProperties: '=',
                machinesList: '='
            },
            templateUrl: 'application/directives/default-properties.html'
        };
    });
