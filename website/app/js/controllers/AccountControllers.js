function LoginController($scope, $location, User, alertService, mcapi) {
    $scope.alerts = [];

    $scope.login = function () {
        mcapi('/user/%/%/apikey', $scope.email, $scope.password)
            .success(function (apikey) {
                User.setAuthenticated(true, apikey.apikey, $scope.email);
                $scope.msg = "Logged in Successfully";
                alertService.prepForBroadcast($scope.msg);
                $location.path('/my-tools');
            })
            .error(function (data) {
                alertService.prepForBroadcast(data.error);
            }).jsonp();
    }

    $scope.cancel = function () {
        $location.path("/home");
    }
}

function LogOutController($rootScope, $location, $cookieStore, User, Stater) {
    Stater.clear();
    $rootScope.email_address = '';
    User.setAuthenticated(false, '', '');
    $location.path('/home');
    $cookieStore.remove('mcuser');
}

function CreateAccountController($scope, mcapi, $location, alertService) {
    $scope.create_account = function () {
        if ($scope.password != $scope.confirm_password) {
            //alert("Passwords don't match");
            $scope.msg = "Passwords do not match!"
            alertService.prepForBroadcast($scope.msg);
        }
        else {
            var acc = {};
            acc.email = $scope.email;
            acc.password = $scope.password;
            mcapi('/newuser')
                .success(function (data) {
                    $scope.msg = "Account has been created successfully"
                    alertService.prepForBroadcast($scope.msg);
                    $location.path('/account/login');
                })
                .error(function (data) {
                    alertService.prepForBroadcast(data.error);
                }).post(acc);
        }
    }
}

function AccountDetailsController($scope, mcapi, User, alertService) {
    $scope.new_password = undefined;
    $scope.verify_new_password = undefined;

    mcapi('/user/%', User.u())
        .success(function (data) {
            $scope.account = data;
        }).jsonp();

    $scope.saveChanges = function () {
        if ($scope.new_password) {
            if ($scope.new_password == $scope.verify_new_password) {
                mcapi('/user/%/password/%', User.u(), $scope.new_password)
                    .success(function (data) {
                        $scope.msg = "Password updated successfully"
                    }).error(function (data) {
                        alertService.prepForBroadcast(data.error);
                    }).put();
            } else {
                $scope.msg = "Passwords do not match!"
                alertService.prepForBroadcast($scope.msg);
            }
        }
    }
}

function ApiKeyController($scope, User) {
    $scope.apikey = User.apikey();
}

function ApiKeyResetController($scope, mcapi, User, alertService) {
    mcapi('/user/%/apikey/reset', User.u())
        .success(function (data) {
            $scope.new_apikey = data;
            User.reset_apikey($scope.new_apikey['apikey']);
        }).error(function (data) {
            alertService.prepForBroadcast(data.error);
        }).put();

}

