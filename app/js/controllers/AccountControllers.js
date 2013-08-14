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
    
}