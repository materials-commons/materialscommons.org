Application.Controllers.controller('accountGroups',
    ["$scope", "mcapi", "User", "$state", function ($scope, mcapi, User, $state) {
        mcapi('/user/%/usergroups', User.u())
            .success(function (data) {
                $scope.user_groups = data;
            }).jsonp();


        $scope.createGroup = function () {
            $state.go("account.groupcreate");
        };
    }]);