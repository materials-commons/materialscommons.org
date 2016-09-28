(function (module) {
    module.controller('CreateProcessController', CreateProcessController);
    CreateProcessController.$inject = ["projectsService", "$stateParams", "selectItems",
        "template", "$modal", "processEdit", "$previousState", "$state", "toastr"];

    function CreateProcessController(projectsService, $stateParams, selectItems, template,
                                     $modal, processEdit, $previousState, $state, toastr) {
        var ctrl = this;
        ctrl.process = template;
        ctrl.chooseSamples = chooseSamples;
        ctrl.chooseInputFiles = chooseInputFiles;
        ctrl.chooseOutputFiles = chooseOutputFiles;
        ctrl.linkFilesToSample = linkFilesToSample;
        ctrl.cancel = gotoPreviousState;
        ctrl.submit = submit;
        ctrl.submitAndAnother = submitAndAnother;
        ctrl.remove = removeById;
        ctrl.submitSample = submitSample;
        ctrl.doc = {value: []};
        ctrl.sample = {
            name: '',
            description: '',
            old_properties: [],
            new_properties: [],
            files: []
        };

        ctrl.sampleGroupSizing = 'set-size';
        ctrl.sampleGroupSize = 10;
        ctrl.sampleGroup = false;

        setPreviousStateMemo();

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
                        name: file.name,
                        mediatype: file.mediatype
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
                        name: file.name,
                        mediatype: file.mediatype
                    });
                });
            });
        }

        function gotoPreviousState() {
            $previousState.go('processes_previous');
            $previousState.forget('processes_previous');
        }

        function submitAndAnother() {
            if (ctrl.process.process_name === 'As Received' && ctrl.sample.name === '') {
                toastr.error("You must specify a sample name", 'Error', {closeButton: true});
                return;
            }
            if (ctrl.process.process_name === 'As Received') {
                filloutSample();
            }
            projectsService.createProjectProcess($stateParams.id, ctrl.process).then(function () {
                ctrl.doc.value.length = 0;
                $state.go('projects.project.processes.create', {process: p.process_name, process_id: p.id});
            });
        }

        function submit() {
            projectsService.createProjectProcess($stateParams.id, ctrl.process).then(
                function success() {
                    ctrl.doc.value.length = 0;
                    gotoPreviousState();
                },

                function failure(e) {
                    console.log('failed to save process', e);
                }
            );
        }

        function submitSample() {
            if (ctrl.sample.name === '') {
                toastr.error("You must specify a sample name", 'Error', {closeButton: true});
                return;
            }
            filloutSample();
            submit();
        }

        function filloutSample() {
            if (ctrl.doc.value.length) {
                var composition = ctrl.doc.value.map(function(c) {
                    return {
                        element: c.element,
                        value: c.value
                    };
                });
                var measurement = {
                    name: 'Composition',
                    attribute: 'composition',
                    measurements: [
                        {
                            is_best_measure: true,
                            value: composition,
                            unit: ctrl.doc.unit,
                            _type: 'composition'
                        }
                    ]
                };
                ctrl.sample.new_properties.push(measurement);
            }
            ctrl.sample.has_group = ctrl.sampleGroup;
            if (ctrl.sampleGroupSizing == 'set-size') {
                ctrl.sample.group_size = ctrl.sampleGroupSize;
            } else {
                ctrl.sample.group_size = 0;
            }
            ctrl.process.output_samples.push(ctrl.sample);

            addSampleInputFiles();
        }

        function addSampleInputFiles() {
            var linkedFiles = ctrl.process.input_files.map(function(f) {
                return {
                    id: f.id,
                    command: 'add',
                    name: f.name,
                    sample_id: ""
                }
            });
            ctrl.sample = processEdit.refreshSample(linkedFiles, ctrl.sample);
        }

        // setPreviousStateMemo sets the process_previous memo to the previous state. It
        // only sets the memo if the previous state doesn't exist. If it does exist that
        // means that create has been entered multiple times.
        function setPreviousStateMemo() {
            var previousMemo = $previousState.get('processes_previous');
            var previousState = $previousState.get();
            if (!previousMemo) {
                $previousState.memo('processes_previous');
            } else {
                // previousMemo is not null, but the user may not have cancelled to clear
                // the previousMemo. That is they may have gone to the tabs rather than
                // the cancel button to get out of a create.
                if (previousState.state.name !== 'projects.project.processes.create') {
                    // User did not cancel, so we have an old state. Save new previous state
                    // so user will go where they expect if they press the cancel button.
                    $previousState.memo('processes_previous');
                }
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
                        var setLinked = function (f) {
                            f.linked = (f.id in linkedFilesById);
                            return f;
                        };

                        return files.map(setLinked);
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
                sample = processEdit.refreshSample(linkedFiles, sample);
            });
        }
    }
}(angular.module('materialscommons')));