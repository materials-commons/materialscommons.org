Application.Controllers.controller('_indexNavigation',
    ["$scope", "User", "$state", "Nav",
        function ($scope, User, $state, Nav) {
            $scope.goHome = function () {
                if (User.isAuthenticated()) {
                    $state.go("projects.overview.files");
                } else {
                    $state.go("home");
                }
            };

            $scope.isActiveStep = function (nav) {
                var step =  Nav.isActiveNav(nav);

                if (step === nav){
                    return true
                }else{
                    return false
                }
            };

            $scope.showStep = function (step) {
                Nav.setActiveNav(step);
            };
        }]);

Application.Controllers.controller('contextMenuController',
                                  ["$scope", "actionStackTracker", contextMenuController]);
function contextMenuController($scope, actionStackTracker) {
    $scope.actions = actionStackTracker.actions;
}
