function LoginController($scope, $location, $http, User, $rootScope, $cookieStore) {
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

                var obj = {};
                obj.apikey = apikey.apikey;
                obj.email = $scope.email;
                $cookieStore.put('mcuser', obj);
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

function LogOutController($scope, $rootScope, $location, $cookieStore, User) {
    $rootScope.email_address = '';
    User.setAuthenticated(false, '', '');
    mcglobals.apikey = "";
    $location.path('/home');
    $cookieStore.remove('mcuser');
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
    $scope.verify_new_password = undefined;

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

function ApiKeyController($scope, User){
    $scope.apikey = User.apikey();
}

function ApiKeyResetController($scope, $http, User){
    $http.put(mcurl('/user/%/apikey/reset', User.u()))
        .success(function(data){
            $scope.new_apikey= data;
            console.log("new apikey=" + $scope.new_apikey['apikey']);
            User.reset_apikey($scope.new_apikey['apikey']);
            mcglobals.apikey = $scope.new_apikey['apikey'];
            console.log('mc glabals api key now : ' + mcglobals.apikey);
            console.log(User.apikey());
        }).error(function(){
            console.log("error");
        });

}

function UserGroupController($scope, $http, User, $location){
    $http.jsonp(mcurljsonp('/user/%/usergroups', User.u()))
        .success(function (data) {
            $scope.user_groups = data;
        })
        .error(function () {
            console.log("error:usergroups")
        });

    $scope.create_usergroup = function () {

        var u_group = {};
        u_group.access = "private";
        u_group.dateAdded = "";
        u_group.dateModified = "";
        u_group.description = $scope.desc;
        u_group.id = $scope.name;
        u_group.name = $scope.name;
        u_group.sdateAdded = "";
        u_group.sdateModified = "";

        $http.post(mcurl('/usergroups/new'), u_group)
            .success(function(){
                $location.path('/account/details/usergroups/list_all');
            })
            .error(function(){
                console.log("error in creating a new usergroup");
            });
    }
}

function ListUserGroupController($scope, $http, User){
    $http.jsonp(mcurljsonp('/user/%/all_usergroups', User.u()))
        .success(function (data) {
            $scope.all_user_groups = data;
        })
        .error(function () {
            console.log("error:usergroups")
        });


    $scope.show_users_by_usergroup = function(user_group_id){
        $http.jsonp(mcurljsonp('/usergroup/%/users', user_group_id))
            .success(function(data) {
                $scope.users = data;
                console.log('users are ' + $scope.data);
            });

    }
}