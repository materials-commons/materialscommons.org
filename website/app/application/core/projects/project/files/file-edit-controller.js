(function (module) {
    module.controller("FilesEditController", FilesEditController);

    FilesEditController.$inject = ["$scope", "mcfile", "pubsub","toastr", "file"];

    /* @ngInject */
    function FilesEditController($scope, mcfile, pubsub, toastr, file) {
        var ctrl = this;

        ctrl.newName = "";
        ctrl.renameActive = false;
        ctrl.active = file;
        ctrl.renameFile = renameFile;
        //ctrl.editNote = false;
        //
        //pubsub.waitOn($scope, 'datafile-note.change', function () {
        //    ctrl.editNote = !ctrl.editNote;
        //});
        //
        ctrl.updateTags = updateTags;
        ctrl.downloadSrc = downloadSrc;

        //////////////////////

        function renameFile() {
            if (ctrl.newName === "") {
                return;
            } else if (ctrl.newName === file.name) {
                return;
            }
            file.name = ctrl.newName;
            file.customPUT({name: ctrl.newName}).then(function (f) {
                file.name = f.name;
                ctrl.renameActive = false;
                pubsub.send('files.refresh', file);
            }).catch(function (err) {
                toastr.error("File rename failed: " + err.error, "Error");
            });
        }

        function updateTags() {
            file.customPUT({tags: ctrl.active.tags}).then(function() {
            }).catch(function(err) {
                toastr.error("Failed updating tags: " + err.error, "Error");
            });
        }

        function downloadSrc(file) {
            return mcfile.downloadSrc(file.id);
        }
    }
}(angular.module('materialscommons')));

////////////////////////////////

//
//function createFolder() {
//    var modalInstance = $modal.open({
//        size: 'sm',
//        templateUrl: 'application/core/projects/project/files/create-folder.html',
//        controller: 'FileModalController',
//        controllerAs: 'folder',
//        resolve: {
//            active: function () {
//                return ctrl.active;
//            }
//        }
//    });
//    modalInstance.result.then(function (name) {
//        mcapi('/datadirs')
//            .success(function (datadir) {
//                datadir.parent = ctrl.active;
//                datadir.group = true;
//                ctrl.active.addFolder = false;
//                ctrl.active.children.push(datadir);
//                pubsub.send('files.refresh');
//            })
//            .error(function (err) {
//                toastr.error("Create folder failed: " + err.error, "Error");
//            })
//            .post({
//                project_id: project.id,
//                parent: ctrl.active.datafile_id,
//                name: ctrl.active.name + '/' + name,
//                level: ctrl.active.level + 1
//            });
//    });
//}