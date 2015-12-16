(function (module) {
    module.controller('CreateProcessController', CreateProcessController);
    CreateProcessController.$inject = ["projectsService", "$stateParams", "selectItems",
        "template", "$modal", "processEdit", "$previousState", "$state"];

    function CreateProcessController(projectsService, $stateParams, selectItems, template,
                                     $modal, processEdit, $previousState, $state) {
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
                console.dir(uniqueFiles);
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
            projectsService.createProjectProcess($stateParams.id, ctrl.process).then(function () {
                $state.go('projects.project.processes.create', {process: p.process_name, process_id: p.id});
            });
        }

        function submit() {
            projectsService.createProjectProcess($stateParams.id, ctrl.process).then(
                function success() {
                    gotoPreviousState();
                },

                function failure() {
                    console.log('failure to save process', e);
                }
            );
        }

        function submitSample() {
            ctrl.process.output_samples.push(ctrl.sample);
            submit();
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