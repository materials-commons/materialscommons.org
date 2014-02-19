Application.Controllers.controller('toolbar', ["$scope", function ($scope) {
    $scope.showDrafts = false;
}]);


Application.Controllers.controller('navigation', ["$scope", "$location", function ($scope, $location) {
    $scope.isCurrentPath = function (path) {
        var cur_path = $location.path().substr(0, path.length);
        if (cur_path === path) {
            if (!($location.path().substr(0).length > 1 && path.length === 1)) {
                return "active";
            }
        } else {
            return "";
        }
    };
}]);






