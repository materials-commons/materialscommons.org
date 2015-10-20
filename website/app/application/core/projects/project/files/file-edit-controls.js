(function (module) {
    module.directive('fileEditControls', fileEditControlsDirective);
    function fileEditControlsDirective() {
        return {
            restrict: "E",
            scope: {
                file: "="
            },
            controller: 'FileEditControlsDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/files/file-edit-controls.html'
        };
    }

    module.controller('FileEditControlsDirectiveController', FileEditControlsDirectiveController);
    FileEditControlsDirectiveController.$inject = ['mcfile', 'pubsub', 'toastr', '$modal', 'Restangular', '$stateParams'];

    function FileEditControlsDirectiveController(mcfile, pubsub, toastr, $modal, Restangular, $stateParams) {
        var ctrl = this;

        ctrl.newName = ctrl.file.name;
        ctrl.renameActive = false;
        ctrl.renameFile = renameFile;
        ctrl.downloadSrc = downloadSrc;
        ctrl.deleteFile = deleteFile;
        ctrl.linkTo = linkTo;

        ////////////////////////////////

        function linkTo(what) {
            switch (what) {
            case "processes":
                displayProcesses();
                break;
            case "samples":
                displaySamples();
                break;
            case "notes":
                displayNotes();
                break;
            }
        }

        function displayProcesses() {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/files/processes.html',
                controller: 'DisplayProcessesModalController',
                controllerAs: 'ctrl',
                resolve: {
                    processes: function () {
                        return Restangular.one('v2').one('projects', $stateParams.id).one('processes').get();
                    }
                }
            });
            modal.result.then(function (processes) {
                var processCommands = processes.map(function(p) {
                    return {
                        command: 'add',
                        process_id: p.id,
                        direction: p.input ? 'in' : 'out'
                    };
                });
                ctrl.file.customPUT({processes: processCommands}).then(function(f) {
                });
            });
        }

        function displaySamples() {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/files/samples.html',
                controller: 'DisplaySamplesModalController',
                controllerAs: 'ctrl',
                resolve: {
                    samples: function () {
                        return Restangular.one('v2').one('projects', $stateParams.id).one('samples').get();
                    }
                }
            });
            modal.result.then(function (samples) {
            });
        }

        function displayNotes() {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/files/notes.html',
                controller: 'DisplayNotesModalController',
                controllerAs: 'ctrl',
                resolve: {
                    notes: function () {
                        return Restangular.one('v2').one('projects', $stateParams.id).one('notes').get();
                    }
                }
            });
            modal.result.then(function (notes) {
            });
        }

        function deleteFile() {
            ctrl.file.remove().then(function (f) {
                // do something here with deleting the file.
            }).catch(function (err) {
                toastr.error("File deletion failed: " + err.error, "Error");
            });
        }

        function renameFile() {
            if (ctrl.newName === "") {
                return;
            } else if (ctrl.newName === ctrl.file.name) {
                ctrl.renameActive = false;
                return;
            }
            ctrl.file.name = ctrl.newName;
            ctrl.file.customPUT({name: ctrl.newName}).then(function (f) {
                ctrl.file.name = f.name;
                ctrl.renameActive = false;
                pubsub.send('files.refresh', ctrl.file);
            }).catch(function (err) {
                toastr.error("File rename failed: " + err.error, "Error");
            });
        }

        function downloadSrc() {
            return mcfile.downloadSrc(ctrl.file.id);
        }
    }

    module.controller('DisplayProcessesModalController', DisplayProcessesModalController);
    DisplayProcessesModalController.$inject = ['$modalInstance', 'processes'];

    function DisplayProcessesModalController($modalInstance, processes) {
        var ctrl = this;
        ctrl.processes = processes;
        ctrl.ok = ok;

        ////////////////////

        function ok() {
            var selected = [];
            ctrl.processes.forEach(function(p) {
                if (p.input) {
                    selected.push({
                        id: p.id,
                        input: true
                    });
                }

                if (p.output) {
                    selected.push({
                        id: p.id,
                        output: true
                    });
                }
            });
            $modalInstance.close(selected);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }

    module.controller('DisplaySamplesModalController', DisplaySamplesModalController);
    DisplaySamplesModalController.$inject = ['$modalInstance', 'processes'];

    function DisplaySamplesModalController($modalInstance, processes) {
        var ctrl = this;
        ctrl.processes = processes;
        ctrl.ok = ok;

        ////////////////////

        function ok() {
            $modalInstance.close(ctrl.processes[0]);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }

    module.controller('DisplayNotesModalController', DisplayNotesModalController);
    DisplayNotesModalController.$inject = ['$modalInstance', 'processes'];

    function DisplayNotesModalController($modalInstance, processes) {
        var ctrl = this;
        ctrl.processes = processes;
        ctrl.ok = ok;

        ////////////////////

        function ok() {
            $modalInstance.close(ctrl.processes[0]);
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

    }
}(angular.module('materialscommons')));

