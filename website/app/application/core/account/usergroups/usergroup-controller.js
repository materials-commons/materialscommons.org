Application.Controllers.controller('accountUserGroup',
    ["$scope", "mcapi", "$state", "$stateParams", "User", "alertService", "pubsub","model.Projects",
        function ($scope, mcapi, $state, $stateParams, User, alertService, pubsub, Projects) {
            pubsub.waitOn($scope, 'usergroups.change', function () {
                $scope.getGroups();
            });
            pubsub.waitOn($scope, 'users_by_usergroup.change', function () {
                $scope.refreshUsers();
            });

            $scope.refreshUsers = function () {
                mcapi('/usergroup/%', $stateParams.id)
                    .success(function (data) {
                        $scope.selected_usergroup = data;
                        $scope.signed_in_user = User.u();
                        $scope.users_by_usergroup = data.users;
                    }).jsonp();

            };

            $scope.getGroups = function () {
                mcapi('/user/%/usergroups', User.u())
                    .success(function (data) {
                        $scope.user_groups = data;
                    }).jsonp();
            };

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

            $scope.addUser = function () {
                mcapi('/usergroup/%/selected_name/%', $stateParams.id, $scope.user_name)
                    .success(function (data) {
                        alertService.sendMessage("user has been added.");
                        $scope.users_by_usergroup.push(data.id);
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put();
            };

            $scope.addProject = function () {
                mcapi('/usergroup/%/selected_name/%', $stateParams.id, $scope.prj)
                    .success(function (data) {
                        alertService.sendMessage("user has been added.");
                        $scope.users_by_usergroup.push(data.id);
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put();
            };

            $scope.deleteUser = function (index) {
                mcapi('/usergroup/%/selected_name/%/remove', $stateParams.id, $scope.users_by_usergroup[index])
                    .success(function (data) {
                        alertService.sendMessage("User has been deleted");
                        $scope.refreshUsers();
                    }).error(function () {
                    }).put();

            };

            function init() {
                $scope.group = {
                    name: null,
                    access: null,
                    description: null,
                    projects: []
                };
                $scope.getGroups();
                $scope.refreshUsers();
                mcapi('/users')
                    .success(function (data) {
                        $scope.all_users = data;
                    })
                    .error(function () {
                    }).jsonp();

                Projects.getList().then(function (data) {
                    $scope.projects = data;
                });

            }

            init();
        }]);
