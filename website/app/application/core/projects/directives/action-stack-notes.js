Application.Directives.directive('actionNotes', actionNotesDirective);

function actionNotesDirective() {
    return {
        controller: "actionNotesController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-notes.html"
    };
}

Application.Controllers.controller('actionNotesController',
    ["$scope", "mcapi", "$stateParams", actionNotesController]);

function actionNotesController($scope,mcapi,$stateParams) {

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
