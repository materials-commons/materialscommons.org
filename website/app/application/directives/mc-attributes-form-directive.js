Application.Directives.directive('mcAttributesForm',
    [function () {
        return {
            restrict: "A",
            scope: {
                defaultProperties: '=',
                additionalProperties: '=',
                doc: '=',
                doneName: '='
            },
            templateUrl: 'application/directives/mc-attributes-form.html'
        };
    }]);