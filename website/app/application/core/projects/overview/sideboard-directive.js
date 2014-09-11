Application.Directives.directive('sideboard', sideboardDirective);

function sideboardDirective() {
    return {
        scope: {},
        restrict: "E",
        templateUrl: "application/core/projects/overview/sideboard.html"
    };
}

Application.Controllers.controller('tagsSideboardController',
                                   ["$scope", "User",  tagsSideboardController]);

function tagsSideboardController($scope, User) {
    $scope.tags = User.attr().preferences.tags;
}

Application.Controllers.controller('todosSideboardController',
    ["$scope",  "$stateParams", "model.projects", "User", "toaster", todosSideboardController]);

function todosSideboardController($scope, $stateParams, Projects, User, toaster) {

    $scope.isChecked = function(td){
        td.selected = !td.selected;
        $scope.project.put(User.keyparam()).then(function() {
            if(td.selected == true){
                toaster.pop('success', "ToDo:", "Marked as Done", 3000);
            }else{
                toaster.pop('warning', "ToDo:", "Marked as Not Done", 3000)
            }

        });
    }

    $scope.project_id = $stateParams.id;
    Projects.get($scope.project_id).then(function(project) {
        $scope.project = project;
        $scope.todos = project.todos;
    });

}
