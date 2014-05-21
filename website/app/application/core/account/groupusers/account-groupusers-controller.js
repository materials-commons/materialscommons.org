Application.Controllers.controller('accountGroupUsers',
    ["$scope", "mcapi", "$state", "$stateParams", "User", "alertService", "pubsub",
        function ($scope, mcapi, $state, $stateParams, User, alertService, pubsub) {

            $scope.createUserGroup = function () {
                var u_group = {};
                u_group.access = $scope.group.access;
                u_group.description = $scope.group.description;
                u_group.name = $scope.group.name;
                u_group.users = [User.u()];
                u_group.owner = User.u();
                mcapi('/usergroups/new', User.u())
                    .success(function () {
                        alertService.sendMessage("UserGroup has been created successfully");
                        pubsub.send('usergroups.change');
                    })
                    .error(function (errorMsg) {
                        alertService.sendMessage(errorMsg.error);
                    }).post(u_group);
            };

            pubsub.waitOn($scope, 'usergroups.change', function () {
                $scope.getGroups();
            });

            $scope.addUserToUsergroup = function () {
                mcapi('/usergroup/%/selected_name/%', $stateParams.id, $scope.user_name)
                    .success(function (data) {
                        alertService.sendMessage("user has been added.");
                        $scope.users_by_usergroup.push(data.id);
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put();
            };

            $scope.done = function () {
                $state.transitionTo('account');
            };

            $scope.deleteUserFromUsergroup = function (index) {
                mcapi('/usergroup/%/selected_name/%/remove', $stateParams.id, $scope.users_by_usergroup[index])
                    .success(function (data) {
                        alertService.sendMessage("User has been deleted");
                        $scope.users_by_usergroup = data.users;
                    }).error(function () {
                    }).put();

            };
            function init() {
                $scope.group = {
                    name: null,
                    access: null,
                    description: null
                };
                mcapi('/user/%/usergroups', User.u())
                    .success(function (data) {
                        $scope.user_groups = data;
                    }).jsonp();

                mcapi('/users')
                    .success(function (data) {
                        $scope.all_users = data;
                    })
                    .error(function () {
                    }).jsonp();

                mcapi('/usergroup/%', $stateParams.id)
                    .success(function (data) {
                        $scope.user_group = data;
                        $scope.owner = $scope.user_group.owner;
                        $scope.signed_in_user = User.u();
                        $scope.ug_name = $scope.user_group.name;
                        $scope.users_by_usergroup = data.users;
                    }).jsonp();

            }

            init();
        }]);