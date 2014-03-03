Application.Controllers.controller('accountGroups',
    ["$scope", "mcapi", "User", "$state", "pubsub",
        function ($scope, mcapi, User, $state, pubsub) {

            pubsub.waitOn($scope, 'usergroups.change', function () {
                $scope.getGroups();
            });

            $scope.getGroups = function () {
                mcapi('/user/%/usergroups', User.u())
                    .success(function (data) {
                        $scope.user_groups = data;
                    }).jsonp();
            };

            $scope.createGroup = function () {
                $state.go("account.groupcreate");
            };

            $scope.init = function () {
                $scope.getGroups();
            };

            $scope.init();
        }]);