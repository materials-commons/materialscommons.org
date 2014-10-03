Application.Controllers.controller("projectNotesView",
    ["$scope", "model.projects", "$stateParams", "mcapi", projectNotesView]);

function projectNotesView($scope, Projects, $stateParams, mcapi) {
    $scope.saveData = function () {
        mcapi('/projects/%', $scope.project.id)
            .success(function (data) {
                $scope.reloadProject(true);
            }).put($scope.project);
    };

    $scope.reloadProject = function(reload){
        Projects.getList(reload).then(function (projects) {
            Projects.get($stateParams.id).then(function (project) {
                $scope.project = project;
            });
        });
    }
    $scope.updateNote = function () {
        $scope.saveData();
        $scope.edit_index = -1;
    }
    $scope.editNotes = function (index) {
        $scope.edit_index = index;
    };

    function init() {
        Projects.get($stateParams.id).then(function (project) {
            $scope.project = project;
        });
    }

    init();


}
