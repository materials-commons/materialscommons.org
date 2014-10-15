Application.Controllers.controller("projectNotes",
    ["$scope", "model.projects", "mcapi", "project", projectNotes]);

function projectNotes($scope, Projects, mcapi, project) {
    $scope.saveData = function () {
        mcapi('/projects/%', $scope.project.id)
            .success(function (data) {
                $scope.reloadProject(true);
            }).put($scope.project);
    };

    $scope.reloadProject = function(reload){
        Projects.getList(reload).then(function () {
        });
    };

    $scope.updateNote = function () {
        $scope.saveData();
        $scope.edit_index = -1;
    };

    $scope.editNotes = function (index) {
        $scope.edit_index = index;
    };

    function init() {
        $scope.project = project;
    }

    init();
}
