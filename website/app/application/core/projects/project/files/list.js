Application.Controllers.controller("projectFilesList",
                                   ["$scope", "projectFiles", "$stateParams",
                                    "projectFileTabs", "$state", "project",
                                    "listParams", "searchParams",
                                    projectFilesListController]);
function projectFilesListController($scope, projectFiles, $stateParams,
                                    projectFileTabs, $state, project, listParams, searchParams) {
    var listEntry = listParams.get("file-list");
    var value = listEntry.filter;
    var key = listEntry.key;

    var searchEntry = searchParams.get("file-list");
    $scope.search = {
        fullname: searchEntry.search
    };

    $scope.files = [];
    var treeModel = new TreeModel();
    var root = treeModel.parse(projectFiles.model.projects[$stateParams.id].dir);
    root.walk({strategy: 'pre'}, function(node) {
        if (node.model[key] == value) {
            $scope.files.push(node.model);
        }
    });

    $scope.openFile = function(f) {
        projectFileTabs.add($stateParams.id, f);
        searchParams.set("file-list", "fullname", $scope.search.fullname);
        $state.go("projects.project.files.view", {fileid: f.id});
    };
}
