Application.Controllers.controller('_indexNavigation',
                                   ["$scope", "User", "$state", "Nav", _indexNavigation]);
function _indexNavigation($scope, User, $state, Nav) {
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
            return true;
        }else{
            return false;
        }
    };

    $scope.showStep = function (step) {
        Nav.setActiveNav(step);
    };
}

Application.Controllers.controller('contextMenuController',
                                   ["$scope", "actionStackTracker", "hotkeys", "$location", "$anchorScroll", contextMenuController]);
function contextMenuController($scope, actionStackTracker, hotkeys, $location, $anchorScroll) {
    $scope.actions = actionStackTracker.actions;
    hotkeys.add({
        combo: 't',
        description: "Top",
        callback: function() {
            $location.hash('top');
            $anchorScroll();
        }
    });

    hotkeys.add({
        combo: 'f',
        description: 'Project File Tree',
        callback: function() {
            $location.hash('projecttree');
            $anchorScroll();
        }
    });

    $scope.gotoLocation = function(id) {
        $location.hash(id);
        $anchorScroll();
    };

}
