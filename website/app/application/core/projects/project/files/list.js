Application.Controllers.controller("projectFilesList",
                                   ["$scope", "projectFiles", "$stateParams",
                                    "projectFileTabs", "$state", "project",
                                    "listParams", "searchParams", "User", "$timeout",
                                    projectFilesListController]);
function projectFilesListController($scope, projectFiles, $stateParams,
                                    projectFileTabs, $state, project,
                                    listParams, searchParams, User, $timeout) {
    $scope.loaded = false;
    $scope.$on("files-loaded", function() {
        $scope.loaded = true;
    });
    var listEntry = listParams.get("file-list");
    var value = listEntry.filter;
    var key = listEntry.key;
    $scope.description = listEntry.description;
    $scope.apikey = User.apikey();

    var searchEntry = searchParams.get("file-list");
    $scope.search = {
        fullname: searchEntry.search
    };

    // Wrap in timeout so that the controller can finish instantiating.
    // The delay in loading this page comes from walking the tree and
    // then displaying the results in the loop. The $scope.$on above
    // will be fired when the loop is done. So the user will get a
    // loading message until everything is ready.
    $timeout(function() {
        $scope.files = [];
        var treeModel = new TreeModel();
        var root = treeModel.parse(projectFiles.model.projects[$stateParams.id].dir);
        root.walk({strategy: 'pre'}, function(node) {
            if (node.model[key] == value) {
                node.model.showDetails = false;
                $scope.files.push(node.model);
            }
        });
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
