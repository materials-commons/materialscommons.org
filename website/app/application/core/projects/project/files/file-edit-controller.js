Application.Controllers.controller("FilesEditController",
    ["$scope", "$stateParams", "projectFiles", "User","mcfile", "pubsub", "tags",FilesEditController]);
function FilesEditController($scope, $stateParams, projectFiles, User,mcfile, pubsub, tags) {
    $scope.bk = {
        content: 'details',
        editNote: false
    };
    pubsub.waitOn($scope, 'datafile-note.change', function () {
        $scope.editNote();
    });
        /*####### Tags ######### */

    $scope.addTag = function (tag) {
        var tag_obj = {'id': tag.id, 'owner': User.u()};
        tags.createTag(tag_obj, $scope.activeFile.id);
    };
    $scope.removeTag = function (tag) {
        tags.removeTag(tag.id, $scope.activeFile.id);
    };

    $scope.showContent = function (content) {
        $scope.bk.content = content;
    };
    $scope.downloadSrc = function (file) {
        return mcfile.downloadSrc(file.id);
    };

    $scope.closeFile = function(){
        $scope.activeFile = '';
    };

    $scope.editNote = function(){
        $scope.bk.editNote =  !$scope.bk.editNote;
    };


    function getActiveFile() {
        $scope.activeFile = projectFiles.getActiveFile();
        if (isImage($scope.activeFile.mediatype)) {
            $scope.fileType = "image";
        } else if ($scope.activeFile.mediatype === "application/pdf") {
            $scope.fileType = "pdf";
        }
        else if ($scope.activeFile.mediatype === "application/vnd.ms-excel") {
                $scope.fileType = "xls";
        } else {
            $scope.fileType = $scope.activeFile.mediatype;
        }

    }
    function init() {
        if ($stateParams.file_id) {
            getActiveFile();
        } else {
            $scope.activeFile = '';
        }
    }

    init();

}
