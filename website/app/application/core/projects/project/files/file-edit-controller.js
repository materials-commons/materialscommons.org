(function (module) {
    module.controller("FilesEditController", FilesEditController);

    FilesEditController.$inject = ["$scope", "$stateParams", "projectFiles", "User", "mcfile",
        "pubsub", "tags", "mcapi", "$modal", "toastr", "project"];

    /* @ngInject */
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
            tags.createTag(tag_obj, ctrl.active.datafile_id);
        }

        function removeTag(tag) {
            tags.removeTag(tag.tag_id, ctrl.active.datafile_id);
        }

        function downloadSrc(file) {
            return mcfile.downloadSrc(file.datafile_id);
        }

        function fileSrc(file) {
            if (file) {
                return mcfile.src(file.datafile_id);
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
                        parent: ctrl.active.datafile_id,
                        name: ctrl.active.name + '/' + name,
                        level: ctrl.active.level + 1
                    });
            });
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
                //ctrl.type = 'file';
                if (isImage(ctrl.active.mediatype.mime)) {
                    ctrl.fileType = "image";
                } else if (ctrl.active.mediatype.mime === "application/pdf") {
                    ctrl.fileType = "pdf";
                } else if (ctrl.active.mediatype.mime === "application/vnd.ms-excel") {
                    ctrl.fileType = "xls";
                } else {
                    ctrl.fileType = ctrl.active.mediatype.mime;
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

    module.controller("FileModalController", FileModalController);

    FileModalController.$inject = ["$modalInstance", "active"];

    /* @ngInject */
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

}(angular.module('materialscommons')));