Application.Controllers.controller('projectProcesses',
    ["$scope", "project", "$state", projectProcesses]);

function projectProcesses($scope, project, $state) {
    this.all = project.processes;
}
