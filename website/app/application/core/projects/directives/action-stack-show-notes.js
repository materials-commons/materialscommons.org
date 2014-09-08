Application.Directives.directive('actionShowNotes', actionShowNotesDirective);

function actionShowNotesDirective() {
    return {
        controller: "actionShowNotesController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-show-notes.html"
    };
}

Application.Controllers.controller('actionShowNotesController',
    ["$scope", "mcapi", "$stateParams", actionShowNotesController]);

function actionShowNotesController($scope,mcapi,$stateParams) {

    $scope.saveData = function () {
                mcapi('/projects/%/update', $scope.project.id)
                    .success(function (data) {
                        //alertService.sendMessage("Notes has been added");
                    }).put($scope.project);
    };

    $scope.editNotes = function(index){
        $scope.edit_index = index;
    };

    $scope.saveNotes = function(index){
        $scope.saveData();
        $scope.edit_index = -1;
    };

    $scope.getProject = function () {
        mcapi('/projects/%', $scope.project_id)
            .success(function (project) {
                $scope.project = project;
            }).jsonp();
    };

    function init() {
        $scope.project_id = $stateParams.id;
        $scope.getProject();
    }
    init();
}
