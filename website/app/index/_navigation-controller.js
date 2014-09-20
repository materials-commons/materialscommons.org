Application.Controllers.controller('_indexNavigation',
                                   ["$scope", "User", "$state", "Nav",  _indexNavigation]);
function _indexNavigation($scope, User, $state, Nav) {

    $scope.goHome = function () {
        if (User.isAuthenticated()) {
            $state.go("projects.project.overview");
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
                                   ["$scope", "actionStackTracker", "hotkeys",
                                    "$location", "$anchorScroll", "pubsub", contextMenuController]);
function contextMenuController($scope, actionStackTracker, hotkeys,
                               $location, $anchorScroll, pubsub) {
    $scope.defaultActions = [
        {
            id: 'create-provenance',
            key: 'c p',
            title: 'Open/Close Create Provenance'
        },
        {
            id: 'show-provenance',
            key: 's p',
            title: 'Open/Close Show Provenance'
        },

        {
            id: 'create-sample',
            key: 'c s',
            title: 'Open/Close Create Sample'
        },
        {
            id: 'show-samples',
            key: 's s',
            title: 'Open/Close Show Samples'
        },

        {
            id: 'create-review',
            key: 'c r',
            title: 'Open/Close Create Review'
        },
        {
            id: 'show-reviews',
            key: 's r',
            title: 'Open/Close Show Reviews'
        },

        {
            id: 'show-drafts',
            key: 's d',
            title: 'Open/Close Show Drafts'
        },

        {
            id: 'create-note',
            key: 'c n',
            title: 'Open/Close Create Note'
        },
        {
            id: 'show-notes',
            key: 's n',
            title: 'Open/Close Show Notes'
        },

        // {
        //     id: 'show-users',
        //     key: 's u',
        //     title: 'Open/Close Show Users'
        // },

        {
            id: 'tag',
            key: 'c t',
            title: 'Open/Close Create Tag'
        }
    ];

    $scope.actions = actionStackTracker.actions;
    hotkeys.add({
        combo: 't',
        description: "Goto Top",
        callback: function() {
            $location.hash('top');
            $anchorScroll();
        }
    });

    hotkeys.add({
        combo: 'b',
        description: 'Goto Bottom',
        callback: function() {
            $location.hash('projecttree');
            $anchorScroll();
        }
    });

    hotkeys.add({
        combo: 'w',
        description: 'Toggle Provenance Magic Bar',
        callback: function() {
            pubsub.send("prov.magicbar");
        }
    });

    $scope.defaultActions.forEach(function(action) {
        hotkeys.add({
            combo: action.key,
            callback: function() {
                $scope.toggleStackAction(action.id, action.title.slice(10));
            }
        });
    });

    $scope.gotoLocation = function(id) {
        $location.hash(id);
        $anchorScroll();
    };

}
