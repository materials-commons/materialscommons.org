function LoginController($scope, $location, $http, User, $rootScope, $cookieStore, alertService) {
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

                $scope.msg = apikey.msg;
                alertService.prepForBroadcast($scope.msg);

            })
            .error(function (data, status) {
                 console.dir(data);
               //console.log('status is  ' + status + ' msg is '+ data.error);

                $scope.msg = data.error;
                //console.log('here is ' + $scope.msg)  ;
                alertService.prepForBroadcast($scope.msg);

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

function CreateAccountController($scope, $http, $location, alertService) {

    $scope.create_account = function () {
        if ($scope.password != $scope.confirm_password) {
            //alert("Passwords don't match");
            $scope.msg = "Passwords do not match!"
            alertService.prepForBroadcast($scope.msg);
            $scope.$on('handleBroadcast', function() {
                $scope.message = alertService.message;
            });
        } else {
            var acc = {};
            acc.email = $scope.email;
            acc.password = $scope.password;
            $http.post(mcurl('/newuser'), acc)
                .success(function (data) {
                    $scope.msg = data.msg
                    alertService.prepForBroadcast($scope.msg);

                    $location.path('/account/login');
                })
                .error(function (data, status) {
                    console.log('status is  ' + status + ' msg is '+ data.error);

                    $scope.msg = data.error;
                    alertService.prepForBroadcast($scope.msg);

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

function ApiKeyResetController($scope, $http, User, $cookieStore){
    $http.put(mcurl('/user/%/apikey/reset', User.u()))
        .success(function(data){
            $scope.new_apikey= data;
            //console.log("new apikey=" + $scope.new_apikey['apikey']);
            User.reset_apikey($scope.new_apikey['apikey']);
            mcglobals.apikey = $scope.new_apikey['apikey'];
            var mcuser = $cookieStore.get('mcuser');
            mcuser.apikey = $scope.new_apikey;
            $cookieStore.put('mcuser');
        }).error(function(){
            //console.log("error");
        });

}

function UserGroupController($scope, $http, User, $location){
    $http.jsonp(mcurljsonp('/user/%/usergroups', User.u()))
        .success(function (data) {
            $scope.user_groups = data;
        })
        .error(function () {
            //console.log("error:usergroups")
        });

    $scope.create_usergroup = function () {

        var u_group = {};
        u_group.access = $scope.access;
        u_group.dateAdded = "";
        u_group.dateModified = "";
        u_group.description = $scope.desc;
        u_group.id = $scope.name;
        u_group.name = $scope.name;
        u_group.sdateAdded = "";
        u_group.sdateModified = "";
        u_group.users = [User.u()];

        $http.post(mcurl('/usergroups/new'), u_group)
            .success(function(data){
                $location.path('/account/details/usergroups/my_list');
            })
            .error(function(){
                //console.log("error in creating a new usergroup");
            });
    }
}

function ListUserGroupController($scope, $http, User){
    $http.jsonp(mcurljsonp('/user/%/all_usergroups', User.u()))
        .success(function (data) {
            $scope.all_user_groups = data;
        })
        .error(function () {
            //console.log("error:usergroups")
        });


}

function ListUserController ($scope, $http, $routeParams, $dialog){
    //Get all users - for select options
    $http.jsonp(mcurljsonp('/private/users'))
        .success(function (data) {
            $scope.all_users = data;
        })
        .error(function () {
            //console.log("error: in finding all users");
        });

    $scope.lab_name =  $routeParams.usergroup_name;
    $http.jsonp(mcurljsonp('/usergroup/%/users', $scope.lab_name))
        .success(function(data) {
            $scope.users_by_usergroup = data;

        })
        .error(function(){
            console.log("error")
        });

    $scope.add_user_to_usergroup = function(){
        var title = '';
        var msg = 'Do you want to add  ' +$scope.user_name + ' to '+ $scope.lab_name + '?';
        var btns = [{result:'no', label: 'no'}, {result:'yes', label: 'yes', cssClass: 'btn-primary'}];

        //from angular ui.bootstrap
        $dialog.messageBox(title, msg, btns)
            .open()
            .then(function(result){
                if (result == 'yes'){
                    //console.log('usergorup is ' + $scope.lab_name + 'user name is '+ $scope.user_name);
                    $http.put(mcurl('/usergroup/%/username/%', $scope.lab_name, $scope.user_name))
                        .success(function(data) {
                            $scope.users_by_usergroup[0].users = data;
                            //console.log("Added username to the usergroup !" + data);
                        }).error(function() {
                            //console.log("Failed to add username");
                        });
                }

            })
    }

    $scope.delete_user_from_usergroup = function(index){
        var title = '';
        var msg = 'Do you want to delete ' +$scope.users_by_usergroup[0].users[index] + ' from '+ $scope.lab_name + '?';
        var btns = [{result:'no', label: 'no'}, {result:'yes', label: 'yes', cssClass: 'btn-primary'}];

        $dialog.messageBox(title, msg, btns)
            .open()
            .then(function(result){
                if (result == 'yes'){
                    $http.put(mcurl('/usergroup/%/username/%/remove', $scope.lab_name, $scope.users_by_usergroup[0].users[index]))
                        .success(function(data) {
                            $scope.users_by_usergroup[0].users = data;
                            //console.log("Removed user name from !" + data);
                        }).error(function() {
                            //console.log("Failed to remove username");
                        });
                }
            })

    }
}

