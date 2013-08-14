function LoginController($scope, $location, $http, User, $rootScope) {
    $scope.alerts = [];
    $scope.failedLogin = false;
    $scope.successfulLogin = false;

    $scope.login = function () {
        $http.jsonp(mcurljsonp('/user/%/%/apikey', $scope.email, $scope.password))
            .success(function (apikey) {
                User.setAuthenticated(true, apikey.apikey, $scope.email);
                $scope.failedLogin = false;
                $scope.successfulLogin = true;
                $scope.connectError = false;
                $location.path('/my-tools');
                $rootScope.email_address = $scope.email;
                mcglobals.apikey = apikey.apikey;
            })
            .error(function () {
                $scope.failedLogin = true;
            });
    }

    $scope.cancel = function () {
        $location.path("/home");
    }

    $scope.closeAlert = function () {
        $scope.alerts.splice(0, 1);
    }
}

function LogOutController($scope, $rootScope, $location, User) {
    $rootScope.email_address = '';
    User.setAuthenticated(false, '', '');
    mcglobals.apikey = "";
    $location.path('/home');
}

function CreateAccountController($scope, $http, $location) {

    $scope.create_account = function () {
        if ($scope.password != $scope.confirm_password) {
            alert("Passwords don't match");
        } else {
            var acc = {};
            acc.email = $scope.email;
            acc.password = $scope.password;
            $http.post(mcurl('/newuser'), acc)
                .success(function () {
                    $location.path('/account/login');
                })
                .error(function () {
                    console.log("Couldn't add user");
                });
        }
    }
}

function AccountDetailsController($scope, $http, User) {
    $scope.new_password = undefined;
    $scope.verify_new_password;

    $http.jsonp(mcurljsonp('/user/%', User.u()))
        .success(function(data) {
            $scope.account = data;
        });

    $scope.saveChanges = function() {
        if ($scope.new_password) {
            if ($scope.new_password == $scope.verify_new_password) {
                $http.put(mcurl('/user/%/password/%', User.u(), $scope.new_password))
                    .success(function(data) {
                        console.log("password changed!");
                    }).error(function() {
                        console.log("Failed to change password");
                    });
            } else {
                console.log("new passwords don't match");
            }
        }
    }
}