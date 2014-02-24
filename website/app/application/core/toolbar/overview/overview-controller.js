Application.Controllers.controller('toolbarOverview',
    ["$scope", "mcapi",
        function ($scope, mcapi) {
            $scope.deleteTodo = function (project, index) {
                project.todos.splice(index, 1);
                mcapi('/projects/%/todos', project.id).put({todos: project.todos});
            };

            $scope.setProject = function (project) {
                $scope.whichProject = project;
            };

            $scope.init = function () {
                mcapi('/projects/by_group')
                    .success(function (data) {
                        $scope.projects = data;
                    }).jsonp();
            };

            $scope.init();
        }]);