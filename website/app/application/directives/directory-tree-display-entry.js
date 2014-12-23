Application.Directives.directive('directoryTreeDisplayEntry', [directoryTreeDisplayEntryDirective]);

function directoryTreeDisplayEntryDirective() {
    return {
        restrict: "E",
        scope: {
            file: '=file'
        },
        replace: true,
        templateUrl: 'application/directives/directory-tree-display-entry.html'
    };
}
