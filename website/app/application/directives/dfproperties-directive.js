Application.Directives.directive('dfProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                defaultProperties: '=',
                machinesList: '=',
                edit: "="
            },
            templateUrl: 'application/directives/default-properties.html'
        };
    });
