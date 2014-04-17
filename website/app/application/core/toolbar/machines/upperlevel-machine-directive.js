Application.Directives.directive('upperlevelMachine',
    function () {
        return {
            restrict: "A",
            controller: "NoteRunController",
            scope: {
                doc: '=',
                edit: '=',
                bk: '='
            },
            templateUrl: 'application/core/toolbar/machines/upperlevel-machine.html'
        };
    });
