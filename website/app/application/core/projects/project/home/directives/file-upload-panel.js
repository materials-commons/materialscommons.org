Application.Directives.directive('fileUploadPanel', fileUploadPanelDirective);
function fileUploadPanelDirective() {
    return {
        restrict: "E",
        replace: true,
        controller: 'fileUploadPanelDirectiveController',
        scope: true,
        templateUrl: 'application/core/projects/project/home/directives/file-upload-panel.html'
    };
}

Application.Controllers.controller("fileUploadPanelDirectiveController",
                                   ["$scope", "mcFlow", "$timeout",
                                    fileUploadPanelDirectiveController]);
function fileUploadPanelDirectiveController($scope, mcFlow, $timeout) {
    $scope.filesByDir = {};
    $scope.dirCount = 0;

    function loadFilesByDir() {
        var files = $scope.flow.files;
        $scope.filesByDir = {}; // reset the list

        // Load files indexed by the directory
        files.forEach(function(file) {
            if (!(file.attrs.directory_name in $scope.filesByDir)) {
                $scope.filesByDir[file.attrs.directory_name] = [];
            }
            $scope.filesByDir[file.attrs.directory_name].push(file);
        });
    }

    $scope.flow = mcFlow.get();
    $scope.flow.on('catchAll', function(eventName) {
        // Force a dirty check of the changed flow state.
        $timeout(function() {
            if (eventName === "filesAdded" || eventName === "fileRemoved") {
                loadFilesByDir();
            }
        });
    });
}
