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
            templateUrl: 'application/directives/upperlevel-sample.html'
        };
    });
