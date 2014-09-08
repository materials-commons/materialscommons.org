Application.Directives.directive('projectDescription', projectDescriptionDirective);

function projectDescriptionDirective() {
    return {
        scope: {
            projectId: "@"
        },
        controller: "projectDescriptionDirectiveController",
        restrict: "E",
        templateUrl: "application/core/projects/overview/project-description.html"
    };
}

Application.Controllers.controller('projectDescriptionDirectiveController',
                                   ["$scope", "User", "model.projects", projectDescriptionDirectiveController]);

function projectDescriptionDirectiveController($scope, User, Projects) {
    $scope.editDescription = false;
    Projects.get($scope.projectId).then(function(project) {
        $scope.project = project;
    });

    $scope.save = function() {
        $scope.project.put(User.keyparam()).then(function() {
            $scope.editDescription = false;
        });
    };
}
