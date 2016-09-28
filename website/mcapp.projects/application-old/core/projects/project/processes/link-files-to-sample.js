(function (module) {
    module.controller("LinkFilesToSampleController", LinkFilesToSampleController);
    LinkFilesToSampleController.$inject = ["$modalInstance", "project", "files", "sample", "mcmodal"];

    function LinkFilesToSampleController($modalInstance, project, files, sample, mcmodal) {
        var ctrl = this;
        ctrl.name = sample.name;
        ctrl.sample_id = sample.id;
        ctrl.files = files;
        ctrl.ok = ok;
        ctrl.cancel = cancel;
        ctrl.filesToLink = [];
        ctrl.linkFile = linkFile;
        ctrl.unlinkFile = unlinkFile;
        ctrl.linkAllFiles = linkAllFiles;
        ctrl.unlinkAllFiles = unlinkAllFiles;
        ctrl.openFile = openFile;
        files.forEach(function (f) {
            ctrl.filesToLink.push({id: f.id, name: f.name, linked: f.linked});
        });
        /////////

        function ok() {
            $modalInstance.close(ctrl.filesToLink);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function linkFile(file) {
            file.linked = true;
            var i = _.indexOf(ctrl.filesToLink, function (f) {
                return (f.id == file.id && f.sample_id == file.sample_id);
            });
            if (i !== -1) {
                ctrl.filesToLink.splice(i, 1);
                ctrl.filesToLink.push({
                    id: file.id,
                    command: 'add',
                    name: file.name,
                    linked: file.linked,
                    sample_id: ctrl.sample_id
                });
            } else {
                ctrl.filesToLink.push({
                    id: file.id,
                    command: 'add',
                    name: file.name,
                    linked: file.linked,
                    sample_id: ctrl.sample_id
                });
            }
        }

        function unlinkFile(file) {
            file.linked = false;
            var i = _.indexOf(ctrl.filesToLink, function (f) {
                return (f.id == file.id && f.sample_id == file.sample_id);
            });
            if (i !== -1) {
                ctrl.filesToLink.splice(i, 1);
                ctrl.filesToLink.push({
                    id: file.id,
                    command: 'delete',
                    name: file.name,
                    linked: file.linked,
                    sample_id: ctrl.sample_id
                });
            }
        }

        function linkAllFiles() {
            ctrl.filesToLink = [];
            ctrl.files.forEach(function (f) {
                linkFile(f);
            });
        }

        function unlinkAllFiles() {
            ctrl.files.forEach(function (f) {
                unlinkFile(f);
            });
        }

        function openFile(file) {
            mcmodal.openModal(file, 'datafile', project);
        }
    }
}(angular.module('materialscommons')));
