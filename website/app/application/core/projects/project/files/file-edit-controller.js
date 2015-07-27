Application.Controllers.controller("FilesEditController",
    ["$scope", "$stateParams", "projectFiles", "User", "mcfile", "pubsub", "tags", "mcapi", "$modal", "toastr", "$state",
        FilesEditController]);
function FilesEditController($scope, $stateParams, projectFiles, User, mcfile, pubsub, tags, mcapi, $modal, toastr, $state) {
    var ctrl = this;

    ctrl.editNote = false;

    pubsub.waitOn($scope, 'datafile-note.change', function () {
        ctrl.editNote = !ctrl.editNote;
    });

    pubsub.waitOn($scope, 'display-directory', function () {
        ctrl.active = projectFiles.getActiveDirectory();
        ctrl.type = 'dir';
    });

    ctrl.addTag = function (tag) {
        var tag_obj = {'id': tag.tag_id, 'owner': User.u()};
        tags.createTag(tag_obj, ctrl.active.df_id);
    };

    ctrl.removeTag = function (tag) {
        tags.removeTag(tag.tag_id, ctrl.active.df_id);
    };

    ctrl.downloadSrc = function (file) {
        return mcfile.downloadSrc(file.df_id);
    };

    ctrl.fileSrc = function (file) {
        if (file) {
            return mcfile.src(file.df_id);
        }
    };

    ctrl.closeFile = function () {
        ctrl.active = null;
    };

    ctrl.rename = function () {
        var modalInstance = $modal.open({
            size: 'sm',
            templateUrl: 'application/core/projects/project/files/rename-file.html',
            controller: 'RenameFileModalController',
            controllerAs: 'file',
            resolve: {
                active: function () {
                    return ctrl.active;
                }
            }
        });

        modalInstance.result.then(function (name) {
            mcapi("/datafile/%", $stateParams.file_id)
                .success(function () {
                    ctrl.active.name = name;
                    pubsub.send('files.refresh');
                })
                .error(function (err) {
                    toastr.error("Rename failed: " + err.error, "Error");
                })
                .put({name: name});
        });
    };

    function getActiveFile() {
        ctrl.active = projectFiles.getActiveFile();
        if (!ctrl.active) {
            // A refresh on page has happened. That means we have lost
            // our state in the directory tree. We have the file but
            // tree isn't open on that file. In this case we show the
            // top level directory.
            ctrl.active = ctrl.active = projectFiles.getActiveDirectory();
            //ctrl.type = 'dir';
        } else {
            //ctrl.type = 'file';
            if (isImage(ctrl.active.mediatype)) {
                ctrl.fileType = "image";
            } else if (ctrl.active.mediatype === "application/pdf") {
                ctrl.fileType = "pdf";
            } else if (ctrl.active.mediatype === "application/vnd.ms-excel") {
                ctrl.fileType = "xls";
            } else {
                ctrl.fileType = ctrl.active.mediatype;
            }
        }
    }

    function init() {
        ctrl.active = {};
        ctrl.type = $stateParams.file_type;
        if (ctrl.type == 'datafile') {
            getActiveFile();
        } else {
            ctrl.active = projectFiles.getActiveDirectory();
        }
    }

    init();
}

////////////////////////////////

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