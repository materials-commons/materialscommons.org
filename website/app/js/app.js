var app = angular.module('materialscommons',
    ['ui', 'Filter', 'materialsCommonsServices', 'materialsdirective', 'stateServices', 'jqyoui', 'AngularStomp',
        'ui.bootstrap', 'NgTree', 'ngCookies', '$strap.directives', 'ngGrid', 'ui.router']);

app.config(function ($stateProvider) {
    Stomp.WebSocketClass = SockJS;
    mcglobals = {};
    doConfig();
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'partials/home.html',
            controller: 'HomeController'
        })
        .state('mytools', {
            url: '/mytools',
            templateUrl: 'partials/my-tools.html',
            controller: 'ListProjectsController'
        })
        .state('projects', {
            url: '/projects',
            templateUrl: 'partials/my-tools.html',
            controller: 'ListProjectsController'
        })
        .state('projects.item', {
            url: '/:project_id',
            templateUrl: 'partials/project/project-report.html',
            controller: function ($scope, $stateParams) {
                $scope.project_id = $stateParams.project_id;
            }
        })
        .state('about', {
            url: '/about',
            templateUrl: 'partials/about.html',
            controller: 'AboutController'

        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'partials/contact.html',
            controller: 'ContactController'

        })
        .state('help', {
            url: '/help',
            templateUrl: 'partials/help.html',
            controller: 'HelpController'

        })
        .state('account/details', {
            url: '/account/details',
            templateUrl: 'partials/account/account-details.html',
            controller: 'AccountDetailsController'
        })
        .state('account/details/apikey/view', {
            url: '/account/details/apikey/view',
            templateUrl: 'partials/account/details/apikeyview.html',
            controller: 'ApiKeyController'
        })
        .state('account/details/apikey/reset', {
            url: '/account/details/apikey/reset',
            templateUrl: 'partials/account/details/apikeyreset.html',
            controller: 'ApiKeyResetController'
        })
        .state('account/logout', {
            url: '/account/logout',
            templateUrl: 'partials/about.html',
            controller: 'LogOutController'

        })
        .state('account/login', {
            url: '/account/login',
            templateUrl: 'partials/account/login.html',
            controller: 'LoginController'

        })
        .state('data/edit/:id', {
            url: '/data/edit/:id',
            templateUrl: 'partials/data/data-edit.html',
            controller: 'DataEditController'
        })
        .state('phones', {
            url: '/phones',
            templateUrl: 'partials/phones.html',
            controller: 'PhoneListController'
        })

    ;
})

app.run(function ($rootScope, $state, $stateParams, $location, $cookieStore, User, ngstomp) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {
        if (matchesPartial(toState, "partials/front-page", "HomeController")) {
            setActiveMainNav("#home-nav");
        }
        else if (matchesPartial(toState, "partials/my-tools", "FrontPageController")) {
            setActiveMainNav("#user-nav");
        }
        else if (matchesPartial(toState, "partials/explore", "ExploreController")) {
            setActiveMainNav("#explore-nav");
        }
        else if (matchesPartial(toState, "partials/about", "AboutController")) {
            setActiveMainNav('#about-nav');
        }
        else if (matchesPartial(toState, "partials/contact", "ContactController")) {
            setActiveMainNav('#contact-nav');
        }
        else if (matchesPartial(toState, "partials/help", "HelpController")) {
            setActiveMainNav("#help-nav");
        }
        if (!$rootScope.stompClient) {
            var chatConnection = "http://" + document.location.hostname + ":15674/stomp";
            if (document.location.hostname == "materialscommons.org") {
                chatConnection = "https://materialscommons.org:55674/stomp";
            }

            $rootScope.stompClient = ngstomp(chatConnection);
        }

        if (mcglobals.bypasslogin) {
            if (mcglobals.username) {
                User.setAuthenticated(true, mcglobals.apikey, mcglobals.username);
                $rootScope.email_address = mcglobals.username;
            }
            return;
        }

        if (!User.isAuthenticated()) {
            if (toState.templateUrl && toState.templateUrl.indexOf("partials/my-tools") != -1) {
                $location.path("/account/login");
            }
        }
        else {
            $rootScope.email_address = User.u();
        }


    });

});

function matchesPartial(next, what, controller) {
    if (!next.templateUrl) {
        return false;
    }
    else {
        var value = next.templateUrl.indexOf(what) != -1;
        /*
         Hack to look at controller name to figure out tab. We do this so that partials can be
         shared by controllers, but we need to show which tab is active. So, we look at the
         name of the controller (only if controller != 'ignore').
         */
        if (controller == "ignore") {
            return value;
        }
        else if (value) {
            return true;
        }
        else {
            return next.controller.toString().indexOf(controller) != -1;
        }
    }
}
