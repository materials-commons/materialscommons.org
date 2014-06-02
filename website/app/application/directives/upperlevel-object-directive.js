Application.Directives.directive('upperlevelObject',
    function () {
        return {
            restrict: "A",
            controller: "NoteRunController",
            scope: {
                doc: '=',
                edit: '=',
                bk: '=',
                spanB: '='
            },
            templateUrl: 'application/directives/upperlevel-object.html'
        };
    });
