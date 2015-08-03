Application.Controllers.controller("FilesEditController",
    ["$scope", "$stateParams", "projectFiles", "User", "mcfile", "pubsub", "tags", "mcapi", "$modal", "toastr", "project",
        FilesEditController]);
function FilesEditController($scope, $stateParams, projectFiles, User, mcfile, pubsub, tags, mcapi, $modal, toastr, project) {
    var ctrl = this;

    ctrl.editNote = false;

    pubsub.waitOn($scope, 'datafile-note.change', function () {
        ctrl.editNote = !ctrl.editNote;
    });

    pubsub.waitOn($scope, 'display-directory', function () {
        ctrl.active = projectFiles.getActiveDirectory();
        ctrl.type = 'dir';
    });

    ctrl.addTag = addTag;
    ctrl.removeTag = removeTag;
    ctrl.downloadSrc = downloadSrc;
    ctrl.fileSrc = fileSrc;
    ctrl.closeFile = closeFile;
    ctrl.rename = rename;
    ctrl.createFolder = createFolder;

    init();

    //////////////////////

    function addTag(tag) {
        var tag_obj = {
            tag_id: tag.tag_id,
            owner: User.u(),
            item_type: 'datafile'
        };
        tags.createTag(tag_obj, ctrl.active.df_id);
    }

    function removeTag(tag) {
        tags.removeTag(tag.tag_id, ctrl.active.df_id);
    }

    function downloadSrc(file) {
        return mcfile.downloadSrc(file.df_id);
    }

    function fileSrc(file) {
        if (file) {
            var id = getID(file);
            return mcfile.src(id);
        }
    }

    function closeFile() {
        ctrl.active = null;
    }

    function rename() {
        var modalInstance = $modal.open({
            size: 'sm',
            templateUrl: 'application/core/projects/project/files/rename-file.html',
            controller: 'FileModalController',
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
    }

    function createFolder() {
        var modalInstance = $modal.open({
            size: 'sm',
            templateUrl: 'application/core/projects/project/files/create-folder.html',
            controller: 'FileModalController',
            controllerAs: 'folder',
            resolve: {
                active: function () {
                    return ctrl.active;
                }
            }
        });
        modalInstance.result.then(function (name) {
            mcapi('/datadirs')
                .success(function (datadir) {
                    datadir.parent = ctrl.active;
                    datadir.group = true;
                    ctrl.active.addFolder = false;
                    ctrl.active.children.push(datadir);
                    pubsub.send('files.refresh');
                })
                .error(function (err) {
                    toastr.error("Create folder failed: " + err.error, "Error");
                })
                .post({
                    project_id: project.id,
                    parent: ctrl.active.df_id,
                    name: ctrl.active.name + '/' + name,
                    level: ctrl.active.level+1
                });
        });
    }

    // TODO: Clean this up so we don't have to search for different id keys
    // returns the file id depending on which key it is under.
    function getID(file) {
        if ('df_id' in file) {
            return file.df_id;
        } else if ('datafile_id' in file) {
            return file.datafile_id;
        } else if ('id' in file) {
            return file.id;
        } else {
            return ""
        }
    }

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
            if (_.isObject(ctrl.active.mediatype)) {
                // TODO: Fix this hack
                // This exists because search sends back the full mediatype, while
                // the tree doesn't.
                ctrl.active.mediatype = ctrl.active.mediatype.mime;
            }
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
}

////////////////////////////////

Application.Controllers.controller("FileModalController",
    ["$modalInstance", "active", FileModalController]);
function FileModalController($modalInstance, active) {
    var ctrl = this;
    ctrl.name = "";
    ctrl.useName = useName;
    ctrl.cancel = cancel;

    ///////////

    function useName() {
        if (ctrl.name != "" && ctrl.name != active.name) {
            $modalInstance.close(ctrl.name);
        }
    }

    function cancel() {
        $modalInstance.dismiss('cancel');
    }
}