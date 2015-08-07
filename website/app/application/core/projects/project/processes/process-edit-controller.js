Application.Controllers.controller('projectEditProcess',
    ["$scope", "project", "$stateParams", "modalInstance", "$state",
        "mcapi", "Projects", "current", projectEditProcess]);

function projectEditProcess($scope, project, $stateParams, modalInstance, $state, mcapi, Projects, current) {

    $scope.cancel = function () {
        $state.go('projects.project.processes.list.view');
    };

    $scope.openFile = function (file) {
        modalInstance.openModal(file, 'datafile', project);
    };

    $scope.openSample = function (sample) {
        modalInstance.openModal(sample, 'sample', project);
    };

    $scope.done = function () {
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
            }).put({name: $scope.template.name, what: $scope.template.what, why: $scope.template.why,
         setup: $scope.template.setup[0].setupproperties, samples: $scope.template.samples});
    };

    function init() {
        $scope.project = project;
        var i = _.indexOf($scope.project.processes, function (process) {
            return process.id === $stateParams.process_id;
        });

        if (i > -1) {
            $scope.template = $scope.project.processes[i];
        }
    }

    init();
}

