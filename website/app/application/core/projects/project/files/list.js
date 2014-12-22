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

    $scope.sideboardSearch = {
        fullname: ""
    };

    $scope.filesExpanded = false;
    $scope.sideboardExpanded = false;

    $scope.sideboard = [];

    $scope.files = projectFiles.model.projects[$stateParams.id].byMediaType[value];

    $scope.toggleDetails = function(file) {
        file.showDetails = !file.showDetails;
    };

    $scope.showDetails = function(file) {
        if (isImage(file.mediatype)) {
            $scope.fileType = "image";
        } else if (file.mediatype === "application/pdf") {
            $scope.fileType = "pdf";
        } else {
            $scope.fileType = file.mediatype;
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
        var url = "datafiles/static/" + file.id+"?apikey=" + $scope.apikey;
        return url;
    };

    $scope.onDrop = function(ignore, file) {
        var i = _.indexOf($scope.sideboard, function(f) {
            return f.id == file.id;
        });

        // If file is already in list then don't add it again.
        if (i === -1) {
            $scope.sideboard.push(file);
        }
    };

    $scope.removeFromSideboard = function(file) {
        var i = _.indexOf($scope.sideboard, function(f) {
            return f.id === file.id;
        });

        if (i !== -1) {
            $scope.sideboard.splice(i, 1);
        }
    };
}
