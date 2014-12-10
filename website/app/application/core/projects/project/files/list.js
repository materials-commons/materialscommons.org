Application.Controllers.controller("projectFilesList",
                                   ["$scope", "projectFiles", "$stateParams",
                                    "projectFileTabs", "$state", "project",
                                    "listParams", "searchParams", "User",
                                    projectFilesListController]);
function projectFilesListController($scope, projectFiles, $stateParams,
                                    projectFileTabs, $state, project,
                                    listParams, searchParams, User) {
    var listEntry = listParams.get("file-list");
    console.dir(listEntry);
    var value = listEntry.filter;
    var key = listEntry.key;
    $scope.description = listEntry.description;

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

    var showFileDetails = [];
    for (var i = 0; i < $scope.files.length; i++) {
        showFileDetails.push(false);
    }

    $scope.toggleDetails = function(index) {
        showFileDetails[index] = !showFileDetails[index];
    };

    $scope.showDetails = function(index) {
        return showFileDetails[index];
    };

    $scope.tags = function(file) {
        var username = User.u();
        if (username in file.tags) {
            return file.tags[username];
        }
        return [];
    };
}
