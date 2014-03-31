Application.Directives.directive('adProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                addedProperties: '=',
                bkNote: '='
            },
            templateUrl: 'application/directives/added-properties.html'
        };
    });