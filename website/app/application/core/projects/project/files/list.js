Application.Controllers.controller("projectFilesList",
                                   ["$scope", "projectFiles", "$stateParams",
                                    "projectFileTabs", "$state", "project",
                                    "listParams", "searchParams", "User",
                                    projectFilesListController]);
function projectFilesListController($scope, projectFiles, $stateParams,
                                    projectFileTabs, $state, project,
                                    listParams, searchParams, User) {
    var listEntry = listParams.get("file-list");
    var value = listEntry.filter;
    var key = listEntry.key;
    $scope.description = listEntry.description;
    $scope.apikey = User.apikey();

    var searchEntry = searchParams.get("file-list");
    $scope.search = {
        fullname: searchEntry.search
    };

    $scope.files = [];
    var treeModel = new TreeModel();
    var root = treeModel.parse(projectFiles.model.projects[$stateParams.id].dir);
    root.walk({strategy: 'pre'}, function(node) {
        if (node.model[key] == value) {
            node.model.showDetails = false;
            $scope.files.push(node.model);
        }
    });

    $scope.openFile = function(f) {
        projectFileTabs.add($stateParams.id, f);
        searchParams.set("file-list", "fullname", $scope.search.fullname);
        $state.go("projects.project.files.view", {fileid: f.id});
    };

    $scope.toggleDetails = function(file) {
        file.showDetails = !file.showDetails;
    };

    $scope.showDetails = function(file) {
        if (isImage(file.mediatype)) {
            $scope.fileType = "image";
        } else if (file.mediatype === "application/pdf") {
            $scope.fileType = "pdf";
        }
        return file.showDetails;
    };

    $scope.tags = function(file) {
        var username = User.u();
        if (username in file.tags) {
            return file.tags[username];
        }
        return [];
    };

    $scope.fileSrc = function(file) {
        return "datafiles/static/" + file.id+"?apikey=" + $scope.apikey;
    };
}
