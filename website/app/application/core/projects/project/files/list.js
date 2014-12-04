Application.Controllers.controller("projectFilesList",
                                   ["$scope", "projectFiles", "$stateParams",
                                    projectFilesListController]);
function projectFilesListController($scope, projectFiles, $stateParams) {
    $scope.files = [];
    var treeModel = new TreeModel();
    var root = treeModel.parse(projectFiles.model.projects[$stateParams.id].dir);
    root.walk({strategy: 'pre'}, function(node) {
        if (node.model.mediatype == $stateParams.mediatype) {
            $scope.files.push(node.model);
        }
    });
}
