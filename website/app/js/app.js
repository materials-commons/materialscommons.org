var app = angular.module('materialscommons',
    ['ui', 'Filter', 'materialsCommonsServices', 'materialsdirective', 'stateServices', 'jqyoui', 'AngularStomp',
        'ui.bootstrap', 'NgTree', 'ngCookies', '$strap.directives', 'ngGrid', 'ui.router']);

app.config(function ($stateProvider) {
    Stomp.WebSocketClass = SockJS;
    mcglobals = {};
    doConfig();
    $stateProvider
    /**
     * Top level navigation
     */
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
//        .state('projects', {
//            url: '/projects',
//            templateUrl: 'partials/my-tools.html',
//            controller: 'ListProjectsController'
//        })
//        .state('projects.item', {
//            url: '/:project_id',
//            templateUrl: 'partials/project/project-report.html',
//            controller: function ($scope, $stateParams) {
//                $scope.project_id = $stateParams.project_id;
//            }
//        })
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
    /**
     * End To level navigation
     */


    /**
     * Mytools - Subpage is the parent and the rest inherit
     */
        .state('subpages', {
            url: '/subpages',
            abstract: true,
            templateUrl: 'partials/my-tools.html'

        })
        .state('subpages.datatab', {
            url: '/datatab',
            templateUrl: 'partials/data/data-subpage.html'

        })
        .state('subpages.myprojects', {
            url: '/myprojects',
            templateUrl: 'partials/datagroups/my_data_groups.html',
            controller: 'MyDataGroupsController'
        })
        .state('subpages.mydata', {
            url: '/mydata',
            templateUrl: 'partials/data/my-data.html',
            controller: 'MyDataController'
        })
        .state('subpages.myprojectstree', {
            url: '/myprojectstree',
            templateUrl: 'partials/datagroups/tree.html',
            controller: 'MyDataGroupsTreeController'
        })
        .state('subpages.groupprojectstree', {
            url: '/groupprojectstree',
            templateUrl: 'partials/datagroups/group-tree.html',
            controller: 'MyGroupsDataGroupsTreeController'
        })
        .state('subpages.thumbnail', {
            url: '/thumbnail',
            templateUrl: 'partials/thumbnail.html',
            controller: 'DataGroupGridController'
        })



        .state('subpages.tagstab', {
            url: '/tagstab',
            templateUrl: 'partials/tags/tags-subpage.html'

        })
        .state('subpages.listtags', {
            url: '/listtags',
            templateUrl: 'partials/tags/tags-list.html',
            controller: 'AllTagsController'
        })
        .state('subpages.mytagslist', {
            url: '/mytagslist',
            templateUrl: 'partials/tags/my-tags-list.html',
            controller: 'MyTagsController'
        })
        .state('subpages.globaltagcloud', {
            url: '/globaltagcloud',
            templateUrl: 'partials/tags/tagcloud.html',
            controller: 'GlobalTagCloudController'
        })



        .state('subpages.conditionstab', {
            url: '/conditionstab',
            templateUrl: 'partials/conditions/conditions-subpage.html'

        })
        .state('subpages.createtemplate', {
            url: '/createtemplate',
            templateUrl: 'partials/conditions/create-template.html',
            controller: 'CreateConditionControllers'
        })
        .state('subpages.listtemplate', {
            url: '/listtemplate',
            templateUrl: 'partials/conditions/list-condition-template.html',
            controller: 'ListConditionControllers'
        })
        .state('subpages.templatereport', {
            url: '/templatereport/:id',
            templateUrl: 'partials/conditions/template-report.html',
            controller: 'TemplateReportController'
        })


        .state('subpages.provenancetab', {
            url: '/provenancetab',
            templateUrl: 'partials/provenance/provenance-subpage.html'

        })
        .state('subpages.uploadtab', {
            url: '/uploadtab',
            templateUrl: 'partials/updownload/upload-subpage.html'

        })
        .state('subpages.uploadfile', {
            url: '/uploadfile',
            templateUrl: 'partials/updownload/upload-file.html',
            controller:'UploadFileController'

        })
        .state('subpages.reviewstab', {
            url: '/reviewstab',
            templateUrl: 'partials/reviews/review-subpage.html'

        })
        .state('subpages.reviewlist', {
            url: '/reviewlist',
            templateUrl: 'partials/reviews/review-list.html',
            controller: 'ReviewListController'
        })
    /**
     * END Subpage
     */



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
        .state('datagroups/data/:id', {
            url: '/datagroups/data/:id',
            templateUrl: 'partials/datagroups/datareport.html',
            controller: 'DataDirReportController'
        })
        .state('data/bytag/:name', {
            url: '/data/bytag/:name',
            templateUrl: 'partials/tags/data-for-tag.html',
            controller: 'TagDataController'
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
            // return next.controller.toString().indexOf(controller) != -1;
            return value
        }
    }
}
