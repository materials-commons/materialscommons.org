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

    hotkeys.del('s t');
    hotkeys.add({
        combo: 's t',
        description: "Top",
        callback: function() {
            $location.hash('top');
            $anchorScroll();
        }
    });

    hotkeys.del('s f');
    hotkeys.add({
        combo: 's f',
        description: 'Project File Tree',
        callback: function() {
            $location.hash('projecttree');
            $anchorScroll();
        }
    });

    $scope.addHotkey = function(key, id, title) {
        console.log("adding hot key: " + key);
        hotkeys.del('s ' + key);
        hotkeys.add({
            combo: 's ' + key,
            description: title,
            callback: function() {
                $location.hash(id);
                $anchorScroll();
            }
        });
    };
}
