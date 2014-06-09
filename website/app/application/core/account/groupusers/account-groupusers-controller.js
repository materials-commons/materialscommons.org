Application.Controllers.controller('accountGroupUsers',
    ["$scope", "mcapi", "$state", "$stateParams", "User", "alertService", "pubsub",
        function ($scope, mcapi, $state, $stateParams, User, alertService, pubsub) {




            function init() {


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