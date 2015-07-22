Application.Controllers.controller('_indexNavigation',
                                   ["$scope", "User", "$state", "current",
                                    _indexNavigation]);
function _indexNavigation($scope, User, $state, current) {
    $scope.goHome = function () {
        if (User.isAuthenticated()) {
            $state.go("projects.project.home", {id: current.projectID()});
        } else {
            $state.go("home");
        }
    };

}
