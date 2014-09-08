Application.Directives.directive('actionShowNotes', actionShowNotesDirective);

function actionShowNotesDirective() {
    return {
        controller: "actionShowNotesController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-show-notes.html"
    };
}

Application.Controllers.controller('actionShowNotesController',
    ["$scope", "User", "model.projects", "$stateParams", actionShowNotesController]);

function actionShowNotesController($scope, User, Projects, $stateParams) {

    $scope.editNotes = function(index){
        $scope.edit_index = index;
    };

    $scope.saveNotes = function(index){
        $scope.project.put(User.keyparam()).then(function() {
            $scope.edit_index = -1;
        });
    };

    function init() {
        $scope.project_id = $stateParams.id;
        Projects.get($scope.project_id).then(function(project) {
            $scope.project = project;
        });
    }

    init();
}
