Application.Controllers.controller("FilesEditController",
    ["$scope", "$stateParams", "projectFiles", "pubsub", FilesEditController]);
function FilesEditController($scope, $stateParams, projectFiles, pubsub) {

    function init() {
        if ($stateParams.file_id) {
            $scope.activeFile = projectFiles.getActiveFile();
        } else {
            $scope.activeFile = {};
        }
    }

    init();

}
