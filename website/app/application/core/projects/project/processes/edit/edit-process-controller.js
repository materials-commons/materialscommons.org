(function (module) {
    module.controller('EditProcessController', EditProcessController);
    EditProcessController.$inject = ["processEdit", "selectItems", "$state", "process",
        "processTemplates", "$modal"];

    function EditProcessController(processEdit, selectItems, $state, process,
                                   processTemplates, $modal) {
        var ctrl = this;
        ctrl.process = process[0];
        ctrl.process['updated_samples'] = [];
        ctrl.process['updated_input_files'] = [];
        ctrl.process['updated_output_files'] = [];
        ctrl.process['samples_files'] = [];

        ctrl.process.process_name = "APT"; //to be deleted
        var template = processTemplates.byName(ctrl.process.process_name);

        ctrl.template = template.create();
        ctrl.chooseSamples = chooseSamples;
        ctrl.chooseInputFiles = chooseInputFiles;
        ctrl.chooseOutputFiles = chooseOutputFiles;
        ctrl.linkFilesToSample = linkFilesToSample;

        ctrl.submit = submit;
        ctrl.cancel = cancel;
        ctrl.remove = remove;
        processEdit.fillProcess(ctrl.template, ctrl.process);

        //////////////////////////////////

        function submit() {
            var updated_process = {
                id: ctrl.process.id,
                what: ctrl.process.what,
                name: ctrl.process.name,
                setup: ctrl.process.setup,
                input_samples: ctrl.process.updated_samples,
                input_files: ctrl.process.updated_input_files,
                output_files: ctrl.process.updated_output_files,
                sample_files: ctrl.process.samples_files
            };
            console.dir(updated_process);
            //Restangular.one('v2').one('projects', $stateParams.id).one('processes', ctrl.process.id).
            //    customPUT(updated_process).then(function () {
            //        $state.go('projects.project.processes.list');
            //    }, function (e) {
            //        console.log('failure to save process', e);
            //    });
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
                        old_properties: [],
                        new_properties: [],
                        property_set_id: sample.property_set_id,
                        files: []
                    });
                    ctrl.process.updated_samples.push({id: sample.id, command: 'add'});
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
                        name: file.name
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

                        var allFiles = files.map(function (f) {
                            if (f.id in linkedFilesById) {
                                f.linked = true;
                            } else {
                                f.linked = false;
                            }
                            return f
                        });
                        return allFiles;
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
                ctrl.process = processEdit.addToProcess(linkedFiles, ctrl.process);
                sample = processEdit.addToSamples(linkedFiles, sample);
            });
        }
    }

}(angular.module('materialscommons')));
;