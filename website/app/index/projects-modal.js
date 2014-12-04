Application.Controllers.controller("newProjectModal",
                                  ["$scope", "mcapi", "model.projects", "current", "$state",
                                   newProjectModalController]);

function newProjectModalController($scope, mcapi, Projects, current, $state) {

    $scope.setProject = function(project) {
        current.setProject(project);
        $state.go("projects.project.home", {id: project.id});
    };

    $scope.createProject = function(){
        if ($scope.model.name === "") {
            return;
        }

        mcapi('/projects')
            .success(function (project) {
                Projects.getList(true).then(function(projects) {
                    $scope.model.name = "";
                    var i = _.indexOf(projects, function(p) {
                        return p.id == project.project_id;
                    });
                    $scope.setProject(projects[i]);
                });
            }).post({'name': $scope.model.name});
    };
}
