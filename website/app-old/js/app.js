var Application = Application || {};

Application.Constants = angular.module('application.constants', []);
Application.Services = angular.module('application.services', []);
Application.Controllers = angular.module('application.controllers', []);
Application.Filters = angular.module('application.filters', []);
Application.Directives = angular.module('application.directives', []);

var app = angular.module('materialscommons',
    ['ui', 'Filter', 'materialsCommonsServices', 'materialsdirective',
        'stateServices', 'jqyoui', 'AngularStomp', 'ui.bootstrap', 'NgTree',
        'ngCookies', '$strap.directives', 'ngGrid', 'ui.router', 'mcdirectives',
        'Provenance', 'ngQuickDate', 'mctree', 'application.constants',
        'application.services', 'application.controllers', 'application.filters',
        'application.directives'
    ]);

app.config(function ($stateProvider) {
    Stomp.WebSocketClass = SockJS;
    mcglobals = {};
    doConfig();
    $stateProvider
        // Navbar
        .state('home', {
            url: '/home',
            templateUrl: 'application/home/home.html'
        })
        .state('toolbar', {
            url: '/toolbar',
            templateUrl: 'application/toolbar/toolbar.html'
        })
        .state('about', {
            url: '/about',
            templateUrl: 'application/about/about.html'
        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'application/contact/contact.html'
        })
        .state('help', {
            url: '/help',
            templateUrl: 'application/help/help.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'application/login/login.html'
        })
        .state('logout', {
            url: '/logout',
            controller: 'logout'
        })
        .state('account', {
            url: '/account',
            templateUrl: 'application/account/account.html'
        })
        .state('mytools', {

        })
        // Projects views
        .state('mytools.projects', {
            url: '/projects/:id/:draft_id',
            templateUrl: 'partials/project/project.html'
        })
        .state('mytools.projects.overview', {
            url: '/overview',
            templateUrl: 'partials/project/overview.html'
        })
        .state('mytools.projects.provenance', {
            url: '/provenance',
            templateUrl: 'partials/project/provenance.html'
        })
        .state('mytools.projects.provenance.process', {
            url: '/process',
            templateUrl: 'partials/project/provenance/process.html'
        })
        .state('mytools.dataedit', {
            url: '/data/edit/:id',
            templateUrl: 'partials/data/data-edit.html',
            controller: 'DataEditController'
        })
        .state('mytools.processreport', {
            url: '/process/report/:process_id',
            templateUrl: 'partials/process/report.html',
            controller: 'ProcessReportController'
        })
        .state('mytools.tagbyname', {
            url: '/data/bytag/:name',
            templateUrl: 'partials/tags/data-for-tag.html',
            controller: 'TagDataController'
        })


    /**
     * End To level navigation
     */


    /**
     * Mytools - Subpage is the parent and the rest inherit
     */

        //Provenance
        .state('mytools.drafts', {
            url: '/drafts',
            templateUrl: 'partials/provenance/drafts-list.html',
            controller: DraftsListController
        })

        .state('mytools.projects.process', {
            url: '/projects/process/new',
            templateUrl: 'partials/process.html'
        })
        .state('mytools.datatab', {
            url: '/datatab',
            templateUrl: 'partials/data/data-subpage.html'
        })
        .state('mytools.mydata', {
            url: '/mydata',
            templateUrl: 'partials/data/my-data.html',
            controller: 'MyDataController'
        })
        .state('mytools.thumbnail', {
            url: '/thumbnail',
            templateUrl: 'partials/thumbnail.html',
            controller: 'DataGroupGridController'
        })
        .state('mytools.provenance', {
            url: '/provenance/:id',
            templateUrl: 'partials/project/add-provenance.html',
            controller: 'ProvenanceController'
        })

        .state('mytools.tagstab', {
            url: '/tagstab',
            templateUrl: 'partials/tags/tags-subpage.html'

        })
        .state('mytools.listtags', {
            url: '/listtags',
            templateUrl: 'partials/tags/tags-list.html',
            controller: 'AllTagsController'
        })
        .state('mytools.mytagslist', {
            url: '/mytagslist',
            templateUrl: 'partials/tags/my-tags-list.html',
            controller: 'MyTagsController'
        })
        .state('mytools.globaltagcloud', {
            url: '/globaltagcloud',
            templateUrl: 'partials/tags/tagcloud.html',
            controller: 'GlobalTagCloudController'
        })


        .state('mytools.conditionstab', {
            url: '/conditionstab',
            templateUrl: 'partials/conditions/conditions-subpage.html'

        })
        .state('mytools.createtemplate', {
            url: '/createtemplate',
            templateUrl: 'partials/conditions/create-template.html',
            controller: 'CreateConditionControllers'
        })
        .state('mytools.listtemplate', {
            url: '/listtemplate',
            templateUrl: 'partials/conditions/list-condition-template.html',
            controller: 'ListConditionControllers'
        })
        .state('mytools.templatereport', {
            url: '/templatereport/:id',
            templateUrl: 'partials/conditions/template-report.html',
            controller: 'TemplateReportController'
        })


        .state('mytools.provenancetab', {
            url: '/provenancetab',
            templateUrl: 'partials/provenance/provenance-subpage.html',
            controller: 'ProvenanceController'

        })

        .state('mytools.provtrack', {
            url: '/provtrack',
            templateUrl: 'partials/provenance/provenance.html',
            controller: 'ProvenanceController'
        })
        .state('mytools.uploadtab', {
            url: '/uploadtab',
            templateUrl: 'partials/updownload/upload-subpage.html'

        })
        .state('mytools.uploadfile', {
            url: '/uploadfile',
            templateUrl: 'partials/updownload/upload-file.html',
            controller: 'UploadFileController'

        })
        .state('mytools.reviewstab', {
            url: '/reviewstab',
            templateUrl: 'partials/reviews/review-subpage.html'

        })
        .state('mytools.reviewlist', {
            url: '/reviewlist',
            templateUrl: 'partials/reviews/review-list.html',
            controller: 'ReviewListController'
        })
        .state('mytools.eachreview', {
            url: '/review/:id',
            templateUrl: 'partials/data/data-edit.html',
            controller: 'DataEditController'
        })
        .state('mytools.machine', {
            url: '/machine',
            templateUrl: 'partials/machine/create-machine.html',
            controller: 'CreateNewMachineController'
        })
        .state('mytools.material', {
            url: '/material',
            templateUrl: 'partials/material/create-material.html',
            controller: 'CreateNewMaterialController'
        })


    /**
     * END Subpage
     */

        .state('account2/create-account', {
            url: '/account/create-account',
            templateUrl: 'partials/account/create-account.html',
            controller: 'CreateAccountController'
        })

        .state('account2/details', {
            url: '/account/details',
            templateUrl: 'partials/account/account.html',
            controller: 'AccountDetailsController'
        })
        .state('account2/details/apikey/view', {
            url: '/account/details/apikey/view',
            templateUrl: 'partials/account/details/apikeyview.html',
            controller: 'ApiKeyController'
        })
        .state('account2/details/apikey/reset', {
            url: '/account/details/apikey/reset',
            templateUrl: 'partials/account/details/apikeyreset.html',
            controller: 'ApiKeyResetController'
        })
        .state('createusergroup', {
            url: '/createusergroup',
            templateUrl: 'partials/usergroups/usergroup-create.html',
            controller: 'CreateUserGroupController'
        })

        .state('myusergoups', {
            url: '/myusergoups',
            templateUrl: 'partials/usergroups/my_usergroups.html',
            controller: 'ListUserGroupController'
        })
        .state('each_usergroup', {
            url: '/myusergoups/:id',
            templateUrl: 'partials/usergroups/usergroup_list_users.html',
            controller: 'ListUserController'
        })


        .state('datagroups/data/:id', {
            url: '/datagroups/data/:id',
            templateUrl: 'partials/datagroups/datareport.html',
            controller: 'DataDirReportController'
        })


    ;


});

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

        if (!User.isAuthenticated()) {
            if (toState.templateUrl && toState.templateUrl.indexOf("partials/my-tools") != -1) {
                $location.path("/login");
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
            return value;
        }
    }
}
