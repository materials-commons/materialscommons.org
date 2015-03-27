Application.Controllers.controller("FilesController",
    ["$scope", "projectFiles", "applySearch",
        "$filter", "pubsub", "mcfile", "tags", "User", FilesController]);
function FilesController($scope, projectFiles, applySearch,
                         $filter, pubsub, mcfile, tags, User) {
    $scope.addTag = function (tag) {
        var tag_obj = {'id': tag.text, 'owner': User.u()};
        tags.createTag(tag_obj);
    };

    $scope.removeTag = function (tag) {
        var tag_obj = {'id': tag.text, 'item_id': $scope.activeFile.id};
        tags.createTag(tag_obj);
    };

    $scope.bk = {
        content: 'details'
    };

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
}
