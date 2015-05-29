Application.Controllers.controller("FilesEditController",
    ["$scope", "$stateParams", "projectFiles", "User","mcfile", "pubsub", "tags",FilesEditController]);
function FilesEditController($scope, $stateParams, projectFiles, User,mcfile, pubsub, tags) {
    $scope.bk = {
        editNote: false
    };

    pubsub.waitOn($scope, 'datafile-note.change', function () {
        $scope.editNote();
    });

    $scope.addTag = function (tag) {
        var tag_obj = {'id': tag.id, 'owner': User.u()};
        tags.createTag(tag_obj, $scope.activeFile.df_id);
    };
    $scope.removeTag = function (tag) {
        tags.removeTag(tag.id, $scope.activeFile.df_id);
    };

    $scope.editNote = function(){
        $scope.bk.editNote =  !$scope.bk.editNote;
    };

    $scope.downloadSrc = function (file) {
        return mcfile.downloadSrc(file.df_id);
    };

    $scope.fileSrc = function (file) {
        if(file){
            return mcfile.src(file.df_id);
        }
    };

    $scope.closeFile = function(){
        $scope.activeFile = '';
    };

    function getActiveFile() {
        $scope.activeFile = projectFiles.getActiveFile();
        console.log($scope.activeFile);
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
        $scope.activeFile = {};
        if ($stateParams.file_id) {
            getActiveFile();
        } else {
            $scope.activeFile = '';
        }
    }

    init();

}
