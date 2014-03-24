Application.Controllers.controller('toolbarDataByTag',
    ["$scope", "$stateParams", "mcapi", function ($scope, $stateParams, mcapi) {
        $scope.tag = $stateParams.name;
        mcapi('/tags/byitem/%', $scope.tag)
            .success(function (data) {
                $scope.docs = data;
            }).jsonp();

    }]);
