Application.Controllers.controller('_toolbarOverviewTodoModal',
    ["$scope", "mcapi",
        function ($scope, mcapi) {
            $scope.newTodo = function () {
                var todo = {};
                if ($scope.todo !== "") {
                    todo.name = $scope.name;
                    todo.description = $scope.description;
                    $scope.whichProject.todos.push(todo);
                    mcapi('/projects/%/update', $scope.whichProject.id)
                        .put({todos: $scope.whichProject.todos});
                }
                $scope.name = "";
                $scope.description = "";
            };

            $scope.addTodoKeypress = function () {
                $scope.newTodo();
                $scope.dismissModal();
            };

            $scope.addTodo = function () {
                $scope.newTodo();
                $scope.dismissModal();
            };

            $scope.init = function () {
                // Nothing to do at the moment.
            };

            $scope.init();
        }]);