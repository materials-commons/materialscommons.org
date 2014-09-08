Application.Controllers.controller('projectsOverviewFiles',
                                   ["$scope", "$stateParams", "ProjectPath", "model.projects", "User", projectsOverviewFiles]);

function projectsOverviewFiles ($scope, $stateParams, ProjectPath, Projects, User) {

    $scope.editDescription = function () {
        $scope.bk.edit_desc = true;
    };

    $scope.save = function () {
        $scope.project.put(User.keyparam()).then(function() {
            $scope.bk.edit_desc = false;
        });
    };

    function init() {
        $scope.bk = {
            edit_desc: false
        };

        $scope.project_id = $stateParams.id;
        $scope.from = ProjectPath.get_from();
        Projects.get($scope.project_id).then(function(project) {
            $scope.project = project;
        });
    }

    init();
}
