(function(module) {
    module.factory('sampleLinker', sampleLinkerService);
    sampleLinkerService.$inject = ['$modal', 'processEdit'];
    function sampleLinkerService($modal) {
        return {
            linkFilesToSample: function(sample, input_files, output_files) {
                var modal = $modal.open({
                    templateUrl: 'app/project/processes/process/services/link-files-to-sample.html',
                    controller: 'LinkFilesToSampleController',
                    controllerAs: 'sample',
                    resolve: {
                        files: function() {
                            var files = input_files.concat(output_files);
                            var linkedFilesById = _.indexBy(sample.files, 'id');
                            var setLinked = function(f) {
                                f.linked = (f.id in linkedFilesById);
                                return f;
                            };

                            return files.map(setLinked);
                        },

                        sample: function() {
                            return sample;
                        },

                        project: function() {
                            return {};
                        }
                    }
                });
                return modal.result;
            }
        }
    }

    module.controller("LinkFilesToSampleController", LinkFilesToSampleController);
    LinkFilesToSampleController.$inject = ["$modalInstance", "files", "sample", "mcmodal"];

    function LinkFilesToSampleController($modalInstance, files, sample, mcmodal) {
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

        /////////////////////////////////////////

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
