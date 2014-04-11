Application.Directives.directive('upperlevelSample',
    function () {
        return {
            restrict: "A",
            controller: "NoteRunController",
            scope: {
                doc: '=',
                edit: '=',
                bk: '='
            },
            templateUrl: 'application/core/toolbar/samples/upperlevel-sample.html'
        };
    });
