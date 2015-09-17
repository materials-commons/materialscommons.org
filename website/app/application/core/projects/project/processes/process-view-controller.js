(function (module) {
    module.controller('projectViewProcess', projectViewProcess);
    projectViewProcess.$inject = ["project", "$stateParams", "modalInstance", "$state", "mcapi"];

    function projectViewProcess(project, $stateParams, modalInstance, $state, mcapi) {
        var viewCtrl = this;

        viewCtrl.openSample = openSample;
        viewCtrl.openFile = openFile;
        viewCtrl.editProvenance = editProvenance;
        viewCtrl.setTab = setTab;
        viewCtrl.isSet = isSet;

        viewCtrl.project = project;
        viewCtrl.tab = 'setup';

        function openSample(sample) {
            modalInstance.openModal(sample, 'sample', viewCtrl.project);
        }

        function openFile(file) {
            modalInstance.openModal(file, 'datafile', viewCtrl.project);
        }

        function editProvenance() {
            $state.go('projects.project.processes.list.edit', {process_id: viewCtrl.current.id});
        }

        function setTab(tabId) {
            viewCtrl.tab = tabId;
        }

        function isSet(tabId) {
            return viewCtrl.tab === tabId;
        }

        function getSampleDetails(process) {
            if (process.samples.length !== 0) {
                mcapi('/samples')
                    .success(function (samples) {
                        console.dir(samples);
                        viewCtrl.current.samples = samples;
                    })
                    .error(function (err) {
                        console.log(err)
                    })
                    .post({samples: process.samples});
            }

        }

        function init() {
            var i = _.indexOf(viewCtrl.project.processes, function (process) {
                return process.id === $stateParams.process_id;
            });

            if (i > -1) {
                viewCtrl.current = viewCtrl.project.processes[i];
                getSampleDetails(viewCtrl.current);
            }
        }

        init();
    }
}(angular.module('materialscommons')));

