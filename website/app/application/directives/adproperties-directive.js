Application.Directives.directive('adProperties',
    function () {
        return {
            restrict: "A",
            scope: {
                addedProperties: '='
            },
            templateUrl: 'application/directives/added-properties.html'
        };
    });