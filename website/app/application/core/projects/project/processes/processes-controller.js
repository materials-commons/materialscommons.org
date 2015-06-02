Application.Controllers.controller('ProcessesController',
    ["$scope", "project", "$state", ProcessesController]);

function ProcessesController($scope, project, $state) {
    this.all = project.processes;
    $state.go('projects.project.processes.list');
}
