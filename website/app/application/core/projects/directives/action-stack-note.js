Application.Directives.directive('actionNote', actionNoteDirective);

function actionNoteDirective() {
    return {
        controller: "actionNoteController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-note.html"
    };
}

Application.Controllers.controller('actionNoteController',
    ["$scope", "mcapi", "$stateParams", "User", "dateGenerate", actionNoteController]);

function actionNoteController($scope, mcapi, $stateParams, User, dateGenerate) {

    $scope.add_notes = function () {
        $scope.project.notes.push({'message': $scope.model.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
        $scope.saveData();
        $scope.model.new_note = "";
    };
    $scope.saveData = function () {
            mcapi('/projects/%/update', $scope.project.id)
                .success(function (data) {
                }).put($scope.project);

    }
    $scope.getProject = function () {
        mcapi('/projects/%', $scope.project_id)
            .success(function (project) {
                $scope.project = project;
            }).jsonp();
    };
    function init() {
        $scope.project_id = $stateParams.id;
        $scope.getProject();
        $scope.model = {
            new_note: ""
        };
    }

    init();
}
