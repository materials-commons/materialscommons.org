function LoginController($scope, $location, User, alertService, decodeAlerts, mcapi) {
    $scope.alerts = [];

    $scope.login = function () {
        mcapi('/user/%/%/apikey', $scope.email, $scope.password)
            .success(function (apikey, status) {
                User.setAuthenticated(true, apikey.apikey, $scope.email);
                $scope.msg = "Logged in Successfully";
                alertService.prepForBroadcast($scope.msg);
                $location.path('/my-tools');
            })
            .error(function () {
                $scope.msg = decodeAlerts.get_alert_msg(data.error);
                alertService.prepForBroadcast($scope.msg);
            }).jsonp();
    }

    $scope.cancel = function () {
        $location.path("/home");
    }
}

function LogOutController($scope, $rootScope, $location, $cookieStore, User) {
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
                    $scope.msg = data.msg
                    alertService.prepForBroadcast($scope.msg);
                    $location.path('/account/login');
                })
                .error(function (data, status) {
                    $scope.msg = data.error;
                    alertService.prepForBroadcast($scope.msg);
                }).post(acc);
        }
    }
}

function AccountDetailsController($scope, mcapi, User) {
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
                        console.log("password changed!");
                    }).error(function () {
                        console.log("Failed to change password");
                    }).put();
            } else {
                console.log("new passwords don't match");
            }
        }
    }

}

function ApiKeyController($scope, User) {
    $scope.apikey = User.apikey();
}

function ApiKeyResetController($scope, mcapi, User, $cookieStore) {
    mcapi('/user/%/apikey/reset', User.u())
        .success(function (data) {
            $scope.new_apikey = data;
            User.reset_apikey($scope.new_apikey['apikey']);
            var mcuser = $cookieStore.get('mcuser');
            mcuser.apikey = $scope.new_apikey;
            $cookieStore.put('mcuser');
        }).error(function () {
            //console.log("error");
        }).put();

}

function UserGroupController($scope, User, mcapi, $location) {
    mcapi('/user/%/usergroups', User.u())
        .success(function (data) {
            $scope.user_groups = data;
        })
        .error(function () {
            //console.log("error:usergroups")
        }).jsonp();

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

        mcapi('/usergroups/new')
            .success(function (data) {
                $location.path('/account/details/usergroups/my_list');
            })
            .error(function () {
                //console.log("error in creating a new usergroup");
            }).post(u_group);
    }
}

function ListUserGroupController($scope, mcapi, User) {
    mcapi('/user/%/all_usergroups', User.u())
        .success(function (data) {
            $scope.all_user_groups = data;
        })
        .error(function () {
            //console.log("error:usergroups")
        }).jsonp();


}

function ListUserController($scope, mcapi, $routeParams, $dialog) {
    //Get all users - for select options
    mcapi('/private/users')
        .success(function (data) {
            $scope.all_users = data;
        })
        .error(function () {
            //console.log("error: in finding all users");
        }).jsonp();

    $scope.lab_name = $routeParams.usergroup_name;
    mcapi('/usergroup/%/users', $scope.lab_name)
        .success(function (data) {
            $scope.users_by_usergroup = data;

        })
        .error(function () {
            console.log("error")
        }).jsonp();

    $scope.add_user_to_usergroup = function () {
        var title = '';
        var msg = 'Do you want to add  ' + $scope.user_name + ' to ' + $scope.lab_name + '?';
        var btns = [
            {result: 'no', label: 'no'},
            {result: 'yes', label: 'yes', cssClass: 'btn-primary'}
        ];

        //from angular ui.bootstrap
        $dialog.messageBox(title, msg, btns)
            .open()
            .then(function (result) {
                if (result == 'yes') {
                    mcapi('/usergroup/%/username/%', $scope.lab_name, $scope.user_name)
                        .success(function (data) {
                            $scope.users_by_usergroup[0].users = data;
                        }).error(function () {
                        }).put();
                }

            })
    }

    $scope.delete_user_from_usergroup = function (index) {
        var title = '';
        var msg = 'Do you want to delete ' + $scope.users_by_usergroup[0].users[index] + ' from ' + $scope.lab_name + '?';
        var btns = [
            {result: 'no', label: 'no'},
            {result: 'yes', label: 'yes', cssClass: 'btn-primary'}
        ];

        $dialog.messageBox(title, msg, btns)
            .open()
            .then(function (result) {
                if (result == 'yes') {
                    mcapi('/usergroup/%/username/%/remove', $scope.lab_name, $scope.users_by_usergroup[0].users[index])
                        .success(function (data) {
                            $scope.users_by_usergroup[0].users = data;
                            //console.log("Removed user name from !" + data);
                        }).error(function () {
                            //console.log("Failed to remove username");
                        }).put();
                }
            })

    }
}

