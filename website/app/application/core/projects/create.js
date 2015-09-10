(function (module) {
    module.controller("CreateProjectController", CreateProjectController);
    CreateProjectController.$inject = ["$scope", "mcapi", "model.projects",
        "current", "$state"];
    function CreateProjectController($scope, mcapi, Projects, current, $state) {
        $scope.setProject = function (project) {
            $scope.project = project;
            current.setProject(project);
            $scope.showProjects = false;
            $state.go("projects.project.home", {id: project.id});
        };

        $scope.createProject = function () {
            if ($scope.model.name === "") {
                return;
            }
            mcapi('/projects')
                .success(function (project) {
                    Projects.getList(true).then(function (projects) {
                        $scope.projects = projects;
                        $scope.model.name = "";
                        var i = _.indexOf($scope.projects, function (p) {
                            return p.id == project.project_id;
                        });
                        $scope.setProject(projects[i]);
                    });
                }).post({'name': $scope.model.name});
        };
    }
}(angular.module('materialscommons')));
