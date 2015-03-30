Application.Controllers.controller("FilesController",
    ["$scope", "projectFiles", "applySearch",
        "$filter", "pubsub", "mcfile", "tags", "User", FilesController]);
function FilesController($scope, projectFiles, applySearch,
                         $filter, pubsub, mcfile, tags, User) {

    $scope.bk = {
        content: 'details'
    };
    $scope.tags = [{'id': 'april1'}];

    pubsub.waitOn($scope, "activeFile.change", function () {
        getActiveFile();
    });

    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    $scope.files = [f];

    applySearch($scope, "searchInput", applyQuery);

    $scope.downloadSrc = function (file) {
        return mcfile.downloadSrc(file.id);
    };

    function applyQuery() {
        var search = {
            name: ""
        };

        if ($scope.searchInput === "") {
            $scope.files = [projectFiles.model.projects[$scope.project.id].dir];
        } else {
            var filesToSearch = projectFiles.model.projects[$scope.project.id].byMediaType.all;
            search.name = $scope.searchInput;
            $scope.files = $filter('filter')(filesToSearch, search);
        }
    }

    function getActiveFile() {
        $scope.activeFile = projectFiles.getActiveFile();
        if (isImage($scope.activeFile.mediatype)) {
            $scope.fileType = "image";
        } else if ($scope.activeFile.mediatype === "application/pdf") {
            $scope.fileType = "pdf";
        } else {
            $scope.fileType = $scope.activeFile.mediatype;
        }

    }

    $scope.fileSrc = function (file) {
        return mcfile.src(file.id);
    };
    $scope.showContent = function (content) {
        $scope.bk.content = content;
    };
    /*
     ######################
     ####### Tags #########
     ######################
     */
    $scope.addTag = function (tag) {
        var tag_obj = {'id': tag.id, 'owner': User.u()};
        tags.createTag(tag_obj, $scope.activeFile.id);
    };
    $scope.removeTag = function (tag) {
        tags.removeTag(tag.id, $scope.activeFile.id);
    };
}
