Application.Directives.directive('sideboard', sideboardDirective);

function sideboardDirective() {
    return {
        scope: {},
        restrict: "E",
        templateUrl: "application/core/projects/project/sideboard.html"
    };
}

Application.Controllers.controller('tagsSideboardController',
                                   ["$scope", "User",  tagsSideboardController]);

function tagsSideboardController($scope, User) {
    $scope.tags = User.attr().preferences.tags;
}

Application.Controllers.controller('todosSideboardController',
    ["$scope",  "$stateParams", "model.projects", "User", todosSideboardController]);

function todosSideboardController($scope, $stateParams, Projects, User) {

    $scope.createName = function(name) {
        if (name.length > 21) {
            return name.substring(0,20)+"...";
        }
        return name;
    };

    $scope.isChecked = function(td){
        td.selected = !td.selected;
        $scope.project.put(User.keyparam()).then(function() {
        });
    };

    $scope.project_id = $stateParams.id;
    Projects.get($scope.project_id).then(function(project) {
        $scope.project = project;
    });

}
