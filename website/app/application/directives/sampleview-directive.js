Application.Directives.directive('sampleView',
    function () {
        return {
            restrict: "A",
            scope: {
                doc: '=',
                edit: '='
            },
            templateUrl: 'application/directives/prov-sample.html'
        };
    });