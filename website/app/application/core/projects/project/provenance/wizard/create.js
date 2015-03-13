Application.Controllers.controller("createProvenanceFromTemplate",
                                   ["$scope", "template", createProvenanceFromTemplate]);

function createProvenanceFromTemplate($scope, template) {
    $scope.template = angular.copy(template);
}
