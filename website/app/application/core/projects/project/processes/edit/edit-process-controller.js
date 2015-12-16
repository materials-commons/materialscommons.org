(function (module) {
    module.controller('EditProcessController', EditProcessController);
    EditProcessController.$inject = ["processEdit", "selectItems", "$state", "$stateParams",
        "process", "$modal", "projectsService"];

    function EditProcessController(processEdit, selectItems, $state, $stateParams, process, $modal, projectsService) {
        var ctrl = this;
        ctrl.process = process;
        ctrl.process['updated_samples'] = [];
        ctrl.process['updated_input_files'] = [];
        ctrl.process['updated_output_files'] = [];
        ctrl.process['samples_files'] = [];

        ctrl.chooseSamples = chooseSamples;
        ctrl.chooseInputFiles = chooseInputFiles;
        ctrl.chooseOutputFiles = chooseOutputFiles;
        ctrl.linkFilesToSample = linkFilesToSample;

        ctrl.submit = submit;
        ctrl.cancel = cancel;
        ctrl.remove = remove;

        //////////////////////////////////

        function submit() {
            var updatedProcess = {
                id: ctrl.process.id,
                what: ctrl.process.what,
                name: ctrl.process.name,
                setup: ctrl.process.setup.settings[0].properties.map(function (p) {
                    p = p.property;
                    var prop = {
                        value: p.value,
                        name: p.name,
                        description: p.description,
                        unit: p.unit,
                        setup_id: p.setup_id,
                        _type: p._type,
                        attribute: p.attribute
                    };
                    if (p.id) {
                        prop.id = p.id;
                    }
                    return prop;
                }),
                input_samples: ctrl.process.updated_samples,
                input_files: ctrl.process.updated_input_files,
                output_files: ctrl.process.updated_output_files,
                sample_files: ctrl.process.samples_files
            };
            projectsService.updateProjectProcess($stateParams.id, updatedProcess).then(
                function success() {
                    $state.go('projects.project.processes.list');
                },
                function failure(e) {
                    console.log('failure to save process', e);
                }
            );
        }

        function cancel() {
            $state.go('projects.project.processes.list');
        }

        function chooseSamples() {
            selectItems.open('samples').then(function (item) {
                var uniqueSamples = differenceById(item.samples, ctrl.process.input_samples);
                uniqueSamples.forEach(function (sample) {
                    ctrl.process.input_samples.push({
                        id: sample.id,
                        name: sample.name,
                        property_set_id: sample.property_set_id,
                        files: []
                    });
                    ctrl.process.updated_samples.push({
                        id: sample.id,
                        command: 'add',
                        property_set_id: sample.property_set_id
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
                        name: file.name,
                        mediatype: file.mediatype
                    });
                    ctrl.process.updated_input_files.push({id: file.id, command: 'add'});
                });
            });
        }

        function chooseOutputFiles() {
            selectItems.open('files').then(function (item) {
                var uniqueFiles = differenceById(item.files, ctrl.process.output_files);
                uniqueFiles.forEach(function (file) {
                    ctrl.process.output_files.push({
                        id: file.id,
                        name: file.name,
                        mediatype: file.mediatype
                    });
                    ctrl.process.updated_output_files.push({id: file.id, command: 'add'});
                });
            });
        }

        function remove(type, item) {
            if (type === 'input_sample') {
                removeFromList('input_samples', item);
                removeFromList('updated_samples', item);
            } else if (type === 'input_file') {
                removeFromList('input_files', item);
                removeFromList('updated_input_files', item);
            } else {
                removeFromList('output_files', item);
                removeFromList('updated_output_files', item);
            }
        }

        function removeFromList(type, item) {
            var i = _.indexOf(ctrl.process[type], function (file) {
                return file.id === item.id
            });
            if (i > -1) {
                ctrl.process[type].splice(i, 1);
            } else {
                ctrl.process[type].push({id: item.id, command: 'delete'})
            }
        }

        function linkFilesToSample(sample, input_files, output_files) {
            var modal = $modal.open({
                templateUrl: 'application/core/projects/project/processes/link-files-to-sample.html',
                controller: 'LinkFilesToSampleController',
                controllerAs: 'sample',
                resolve: {
                    files: function () {
                        var files = input_files.concat(output_files);
                        var linkedFilesById = _.indexBy(sample.files, 'id');
                        var setLinkedFlag = function(f) {
                            f.linked = (f.id in linkedFilesById);
                            return f;
                        };
                        return files.map(setLinkedFlag);
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
                ctrl.process = processEdit.addToSamplesFiles(linkedFiles, ctrl.process);
                sample = processEdit.refreshSample(linkedFiles, sample);
            });
        }
    }

}(angular.module('materialscommons')));