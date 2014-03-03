Application.Controllers.controller('accountGroupCreate',
    ["$scope", "User", "mcapi", "alertService", "$state", "pubsub",
        function ($scope, User, mcapi, alertService, $state, pubsub) {
            $scope.create_usergroup = function () {
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

            $scope.init = function () {
                $scope.group = {
                    name: null,
                    access: null,
                    description: null
                };
            };

            $scope.init();
        }]);