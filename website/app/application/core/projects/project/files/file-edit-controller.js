Application.Controllers.controller("FilesEditController",
    ["$scope", "$stateParams", "projectFiles", "User", "mcfile", "pubsub", "tags", "mcapi", "$modal", FilesEditController]);
function FilesEditController($scope, $stateParams, projectFiles, User, mcfile, pubsub, tags, mcapi, $modal) {

    $scope.bk = {
        editNote: false
    };

    pubsub.waitOn($scope, 'datafile-note.change', function () {
        $scope.editNote();
    });

    pubsub.waitOn($scope, 'display-directory', function () {
        $scope.active = projectFiles.getActiveDirectory();
        $scope.type = 'dir';
    });

    $scope.addTag = function (tag) {
        var tag_obj = {'id': tag.tag_id, 'owner': User.u()};
        tags.createTag(tag_obj, $scope.active.df_id);
    };

    $scope.removeTag = function (tag) {
        tags.removeTag(tag.tag_id, $scope.active.df_id);
    };

    $scope.editNote = function () {
        $scope.bk.editNote = !$scope.bk.editNote;
    };

    $scope.downloadSrc = function (file) {
        return mcfile.downloadSrc(file.df_id);
    };

    $scope.fileSrc = function (file) {
        if (file) {
            return mcfile.src(file.df_id);
        }
    };

    $scope.closeFile = function () {
        $scope.active = null;
    };

    $scope.rename = function () {
        var modalInstance = $modal.open({
            size: 'sm',
            templateUrl: 'application/core/projects/project/files/rename-file.html',
            controller: 'RenameFileModalController',
            controllerAs: 'file',
            resolve: {
                active: function() {
                    return $scope.active;
                }
            }
        });

        modalInstance.result.then(function(name) {
            mcapi("/datafile/%", $stateParams.file_id)
                .success(function () {
                    $scope.active.name = name;
                    pubsub.send('files.refresh');
                })
                .put({name: name});
        });
    };

    function getActiveFile() {
        $scope.active = projectFiles.getActiveFile();
        if (!$scope.active) {
            // A refresh on page has happened, so show top level directory.
            $scope.active = $scope.active = projectFiles.getActiveDirectory();
            $scope.type = 'dir';
        } else {
            $scope.type = 'file';
            if (isImage($scope.active.mediatype)) {
                $scope.fileType = "image";
            } else if ($scope.active.mediatype === "application/pdf") {
                $scope.fileType = "pdf";
            }
            else if ($scope.active.mediatype === "application/vnd.ms-excel") {
                $scope.fileType = "xls";
            } else {
                $scope.fileType = $scope.active.mediatype;
            }
        }
    }

    function init() {
        $scope.active = {};
        $scope.type = '';
        if ($stateParams.file_id !== "") {
            getActiveFile();
        } else {
            $scope.active = projectFiles.getActiveDirectory();
            $scope.type = 'dir';
        }
    }

    init();
}

Application.Controllers.controller("RenameFileModalController",
    ["$modalInstance", "active", RenameFileModalController]);
function RenameFileModalController($modalInstance, active) {
    var ctrl = this;
    ctrl.name = "";
    ctrl.rename = rename;
    ctrl.cancel = cancel;

    ///////////

    function rename() {
        if (ctrl.name != "" && ctrl.name != active.name) {
            $modalInstance.close(ctrl.name);
        }
    }

    function cancel() {
        $modalInstance.dismiss('cancel');
    }
}