Application.Directives.directive("projectSettings", projectSettingsDirective);
function projectSettingsDirective() {
    return {
        scope: {
            project: "=project"
        },
        restrict: "AE",
        replace: true,
        templateUrl: "application/core/projects/project/project-settings.html",
        controller: "projectSettingsDirectiveController"
    };
}

Application.Controllers.controller("projectSettingsDirectiveController",
                                   ["$scope", "$stateParams", "mcapi", "User", "pubsub", "current", projectSettingsDirectiveController]);
function projectSettingsDirectiveController($scope, $stateParams, mcapi, User, pubsub, current) {

    $scope.addUser = function () {
        mcapi('/access/new')
            .success(function (data) {
                $scope.project.users.push({
                    'id': data.id,
                    'user_id': $scope.bk.user_name,
                    'project_id': $scope.project.id,
                    'project_name': $scope.project.name
                });
                pubsub.send('access.change');
                $scope.bk.user_name = '';
            }).post({
                'user_id': $scope.bk.user_name,
                'project_id': $scope.project.id,
                'project_name': $scope.project.name
            });
    };

    $scope.deleteUser = function (id) {
        mcapi('/access/%/remove', id)
            .success(function () {
                var i = _.indexOf($scope.project.users, function (item) {
                    return (item.id === id);
                });
                if (i !== -1) {
                    $scope.project.users.splice(i, 1);
                }
                pubsub.send('access.change');
            }).delete();
    };

    function init() {
        $scope.bk = {
            user_name: ''
        };
        $scope.project = current.project();
        mcapi('/users')
            .success(function (data) {
                $scope.all_users = data;
            }).jsonp();
        $scope.signed_in_user = User.u();
    }
    init();
}
