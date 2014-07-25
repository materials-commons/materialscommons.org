Application.Directives.directive('fileReport',
    function () {
        return {
            restrict: "A",
            scope: {
                file: '='
            },
            templateUrl: 'application/directives/file-report.html'
        };
    });
