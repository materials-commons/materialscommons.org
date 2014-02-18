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
            link: function ($scope) {
                console.log("doneName = " + $scope.doneName);
            },
            templateUrl: 'application/directives/mc-attributes-form.html'
        };
    }]);