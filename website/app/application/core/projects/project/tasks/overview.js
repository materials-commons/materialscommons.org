Application.Controllers.controller("projectTasksOverview",
    ["$scope", "project", "User", "recent", projectTasksOverview]);

function projectTasksOverview($scope, project, User, recent) {

    $scope.markAsDone = function (todo) {
        var updated_todos = [];
        var i = _.indexOf($scope.project.todos, function (item) {
            if (item !== todo) {
                updated_todos.push(item)
            }
        });

        $scope.project.todos = updated_todos;
        project.put(User.keyparam()).then(function (task) {
        }, function (reason) {
            toastr.error(reason.data.error, 'Error', {
                closeButton: true
            });
        });
    }

    function init() {
        $scope.project = project;
    }

    init();
}
