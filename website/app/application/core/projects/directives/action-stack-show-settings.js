Application.Directives.directive('actionShowSettings', actionShowSettingsDirective);

function actionShowSettingsDirective() {
    return {
        controller: "actionShowSettingsController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-show-settings.html"
    };
}

Application.Controllers.controller('actionShowSettingsController',
    ["$scope", "User", "mcapi", "$stateParams","pubsub", "model.projects", actionShowSettingsController]);

function actionShowSettingsController($scope, User, mcapi, $stateParams, pubsub, Projects) {

    $scope.addUser = function () {
        mcapi('/access/new')
            .success(function (data) {
                $scope.project.users.push({'id': data.id, 'user_id': $scope.bk.user_name, 'project_id': $scope.project_id, 'project_name': $scope.project.name})
                pubsub.send('access.change');
                $scope.bk.user_name = '';
            }).post({'user_id': $scope.bk.user_name, 'project_id': $scope.project_id, 'project_name': $scope.project.name});
    };

    $scope.deleteUser = function (id) {
        mcapi('/access/%/remove', id)
            .success(function () {
                var i = _.indexOf($scope.project.users, function (item) {
                    return (item.id === id);
                });
                if(i !== -1){
                    $scope.project.users.splice(i, 1)
                }
                pubsub.send('access.change');
            }).delete();
    };

    function init() {
        $scope.bk = {
            user_name: ''
        }
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
        });

        $scope.signed_in_user = User.u();
    }

    init();
}
