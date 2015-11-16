(function (module) {
    module.controller('CreateProcessController', CreateProcessController);
    CreateProcessController.$inject = ["Restangular", "$stateParams", "selectItems", "$previousState",
        "template", "$modal"];

    function CreateProcessController(Restangular, $stateParams, selectItems, $previousState, template, $modal) {
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
            $previousState.go();
        }

        function submit() {
            console.dir(ctrl.process);
            Restangular.one('v2').one('projects', $stateParams.id).one('processes').
                customPOST(ctrl.process).then(function () {
                    $previousState.go();
                }, function (e) {
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
                    sample: function () {
                        return sample;
                    },
                    project: function () {
                        return {};
                    }
                }
            });
            modal.result.then(function (linkedFiles) {
                linkedFiles.forEach(function (f) {
                    if ('command' in f) {
                        if (f.command === 'add') {
                            var i = _.indexOf(sample.files, function (item) {
                                return f.id === item.id;
                            });
                            if (i !== -1) {
                                sample.files.splice(i, 1);
                                sample.files.push({id: f.id, command: f.command, name: f.name});
                            } else {
                                sample.files.push({id: f.id, command: f.command, name: f.name});
                            }
                        }
                        else {
                            var i = _.indexOf(sample.files, function (item) {
                                return f.id == item.id;
                            });
                            if (i !== -1) {
                                sample.files.splice(i, 1);
                            }
                        }
                }
            });
        }

    )
        ;
    }
}

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
        //if(f.linked == true){
        ctrl.filesToLink.push({id: f.id, name: f.name, linked: f.linked});
        //}
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
            ctrl.filesToLink.push({id: file.id, command: 'add', name: file.name, linked: file.linked, sample_id: ctrl.sample_id});
        } else {
            ctrl.filesToLink.push({id: file.id, command: 'add', name: file.name, linked: file.linked, sample_id: ctrl.sample_id});
        }
    }

    function unlinkFile(file) {
        file.linked = false;
        var i = _.indexOf(ctrl.filesToLink, function (f) {
            return (f.id == file.id && f.sample_id == file.sample_id);
        });
        if (i !== -1) {
            ctrl.filesToLink.splice(i, 1);
            ctrl.filesToLink.push({id: file.id, command: 'delete', name: file.name, linked: file.linked, sample_id: ctrl.sample_id});
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
}
(angular.module('materialscommons'))
)
;
