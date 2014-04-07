Application.Directives.directive('sampleView',
    function () {
        return {
            restrict: "A",
            scope: {
                doc: '=',
                ngDisabled: '='
            },
            templateUrl: 'application/directives/prov-sample.html'
        };
    });