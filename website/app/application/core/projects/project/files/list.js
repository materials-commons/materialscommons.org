Application.Controllers.controller("projectFilesList",
                                   ["$scope", "projectFiles", "$stateParams",
                                    "projectFileTabs", "$state",
                                    projectFilesListController]);
function projectFilesListController($scope, projectFiles, $stateParams, projectFileTabs, $state) {
    $scope.files = [];
    var treeModel = new TreeModel();
    var root = treeModel.parse(projectFiles.model.projects[$stateParams.id].dir);
    root.walk({strategy: 'pre'}, function(node) {
        if (node.model.mediatype == $stateParams.mediatype) {
            $scope.files.push(node.model);
        }
    });

    $scope.openFile = function(f) {
        projectFileTabs.add($stateParams.id, f);
        $state.go("projects.project.files.view", {fileid: f.id});
    };
}
