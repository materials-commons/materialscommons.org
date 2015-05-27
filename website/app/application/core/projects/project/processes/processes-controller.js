Application.Controllers.controller('ProcessesController',
                                   ["$scope", "project", ProcessesController]);

function ProcessesController($scope, project) {
    this.all = project.processes;
}
