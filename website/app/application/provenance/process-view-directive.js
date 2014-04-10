Application.Directives.directive('processView',
    function () {
        return {
            restrict: "A",
            scope: {
                process: '=',
                edit: '=',
                addnotesFn: '&',
                addrunFn: '&',
                bk: '='
            },
            templateUrl: 'application/provenance/process-view.html'
        };
    });
