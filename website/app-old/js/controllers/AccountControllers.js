
function CreateAccountController($scope, mcapi, $state, alertService) {
    $scope.create_account = function () {
        if ($scope.password != $scope.confirm_password) {
            $scope.msg = "Passwords do not match!"
            alertService.sendMessage($scope.msg);
        }
        else {
            var acc = {};
            acc.email = $scope.email;
            acc.password = $scope.password;
            mcapi('/newuser')
                .success(function (data) {
                    $scope.msg = "Account has been created successfully"
                    alertService.sendMessage($scope.msg);
                    $state.transitionTo('account/login')
                })
                .error(function (data) {
                    alertService.sendMessage(data.error);
                }).post(acc);
        }
    }
}




