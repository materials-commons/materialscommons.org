(function (module) {
    module.controller('CreateProcessController', CreateProcessController);
    CreateProcessController.$inject = ["Restangular", "$stateParams", "selectItems", "$state", "template", "$modal"];

    function CreateProcessController(Restangular, $stateParams, selectItems, $state, template, $modal) {
        var ctrl = this;

        ctrl.process = template;
        ctrl.chooseSamples = chooseSamples;
        ctrl.chooseInputFiles = chooseInputFiles;
        ctrl.chooseOutputFiles = chooseOutputFiles;
        ctrl.linkFilesToSample = linkFilesToSample;
        ctrl.cancel = cancel;
        ctrl.submit = submit;
        ctrl.remove = removeById;

        /////////////////////////

        function chooseSamples() {
            selectItems.open('samples').then(function (item) {
                var uniqueSamples = differenceById(item.samples, ctrl.process.input_samples);
                uniqueSamples.forEach(function (sample) {
                    ctrl.process.input_samples.push({
                        id: sample.id,
                        name: sample.name,
                        old_properties: [],
                        new_properties: [],
                        property_set_id: sample.property_set_id,
                        files: []
                    });
                });
            });
        }

        function chooseInputFiles() {
            selectItems.open('files').then(function (item) {
                var uniqueFiles = differenceById(item.files, ctrl.process.input_files);
                uniqueFiles.forEach(function (file) {
                    ctrl.process.input_files.push({
                        id: file.id,
                        name: file.name
                    });
                });
            });
        }

        function chooseOutputFiles() {
            selectItems.open('files').then(function (item) {
                var uniqueFiles = differenceById(item.files, ctrl.process.output_files);
                uniqueFiles.forEach(function (file) {
                    ctrl.process.output_files.push({
                        id: file.id,
                        name: file.name
                    });
                });
            });
        }

        function cancel() {
            $state.go('projects.project.processes.list');
        }

        function submit() {
            console.dir(ctrl.process);
            Restangular.one('v2').one('projects', $stateParams.id).one('processes').
                customPOST(ctrl.process).then(function () {
                    $state.go('projects.project.processes.list');
            }, function(e) {
                console.log('failure to save process', e);
            });
        }

        function linkFilesToSample(sample, input_files, output_files) {
            var modal = $modal.open({
                templateUrl: 'application/core/projects/project/processes/link-files-to-sample.html',
                controller: 'LinkFilesToSampleController',
                controllerAs: 'sample',
                resolve: {
                    files: function () {
                        return input_files.slice().concat(output_files);
                    },
                    sampleName: function () {
                        return sample.name;
                    },
                    project: function () {
                        return {};
                    }
                }
            });
            modal.result.then(function (linkedFiles) {
                linkedFiles.forEach(function (f) {
                    sample.files.push({id: f.id, name: f.name});
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
                return f.id == file.id;
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
