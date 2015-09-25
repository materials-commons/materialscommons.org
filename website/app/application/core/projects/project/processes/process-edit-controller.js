(function (module) {
    module.controller('projectEditProcess', projectEditProcess);
    projectEditProcess.$inject = ["$scope", "project", "$stateParams", "modalInstance", "$state",
        "mcapi", "Projects", "current"];

    function projectEditProcess($scope, project, $stateParams, modalInstance, $state, mcapi, Projects, current) {
        var editCtrl = this;

        editCtrl.cancel = cancel;
        editCtrl.openFile = openFile;
        editCtrl.openSample = openSample;
        editCtrl.done = done;

        editCtrl.propject = project;
        editCtrl.process = process;


        function cancel() {
            $state.go('projects.project.processes.list.view');
        }

         function openFile(file) {
            modalInstance.openModal(file, 'datafile', project);
        }

        function openSample(sample) {
            modalInstance.openModal(sample, 'sample', project);
        }

        function done() {
            mcapi('/processes/%', $scope.template.id)
                .success(function (proc) {
                    //Currently i'm reloading all the projects , but we need to reload single project.
                    Projects.getList(true).then(function (projects) {
                        var i = _.indexOf(projects, function (p) {
                            return p.id == project.id;
                        });
                        current.setProject(projects[i]);
                        project.processes = projects[i].processes;
                        project.samples = projects[i].samples;
                        $scope.template = '';
                        $scope.bk = {
                            selectedSample: {}
                        };
                        console.log("success");
                        $state.go('projects.project.processes.list.view');
                    });
                }).put({
                    name: $scope.template.name, what: $scope.template.what, why: $scope.template.why,
                    setup: $scope.template.setup[0].setupproperties, samples: $scope.template.samples
                });
        }
    }
}(angular.module('materialscommons')));

