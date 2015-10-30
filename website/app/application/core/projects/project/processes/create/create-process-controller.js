(function (module) {
    module.controller('CreateProcessController', CreateProcessController);
    CreateProcessController.$inject = ["Restangular", "$stateParams", "selectItems", "$state", "template"];

    function CreateProcessController(Restangular, $stateParams, selectItems, $state, template) {
        var ctrl = this;

        ctrl.process = template;
        ctrl.chooseSamples = chooseSamples;
        ctrl.chooseInputFiles = chooseInputFiles;
        ctrl.chooseOutputFiles = chooseOutputFiles;
        ctrl.linkFilesToSample = linkFilesToSample;
        ctrl.cancel = cancel;
        ctrl.submit = submit;

        /////////////////////////

        function chooseSamples() {
            selectItems.open('samples').then(function(item) {
                console.dir(item.samples);
            });
        }

        function chooseInputFiles() {
            selectItems.open('files').then(function(item) {
                console.dir(item.files);
            });
        }

        function chooseOutputFiles() {
            selectItems.open('files').then(function(item) {
                console.dir(item.files);
            });
        }

        function cancel () {
            console.log('cancel');
            //$state.go('projects.project.processes.list');
        }

        function submit() {
            console.log('submit process');
        }

        function linkFilesToSample(files, sample) {
            var modal = $modal.open({
                templateUrl: 'application/core/projects/project/processes/link-files-to-sample.html',
                controller: 'LinkFilesToSampleController',
                controllerAs: 'sample',
                resolve: {
                    files: function () {
                        return files;
                    },
                    sampleName: function () {
                        return sample.name;
                    },
                    project: function () {
                        return project;
                    }
                }
            });
            modal.result.then(function (linkedFiles) {
                linkedFiles.forEach(function (f) {
                    sample.files.push({id: f.datafile_id, name: f.name});
                })
            });
        }
    }

    module.controller("LinkFilesToSampleController", LinkFilesToSampleController);
    LinkFilesToSampleController.$inject = ["$modalInstance", "project", "files", "sampleName", "modalInstance"];

    function LinkFilesToSampleController($modalInstance, project, files, sampleName, modalInstance) {
        var ctrl = this;
        ctrl.name = sampleName;
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
            f.linked = false;
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
            ctrl.filesToLink.push(file);
        }

        function unlinkFile(file) {
            var i = _.indexOf(ctrl.filesToLink, function (f) {
                return f.datafile_id == file.datafile_id;
            });

            if (i !== -1) {
                file.linked = false;
                ctrl.filesToLink.splice(i, 1);
            }
        }

        function linkAllFiles() {
            ctrl.filesToLink = [];
            ctrl.files.forEach(function (f) {
                f.linked = true;
                ctrl.filesToLink.push(f);
            });
        }

        function unlinkAllFiles() {
            ctrl.files.forEach(function (f) {
                f.linked = false;
            });
            ctrl.filesToLink = [];
        }

        function openFile(file) {
            modalInstance.openModal(file, 'datafile', project);
        }
    }
}(angular.module('materialscommons')));
