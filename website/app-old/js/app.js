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

        // Account
        .state('account', {
            url: '/account',
            templateUrl: 'application/account/account.html'
        })
        .state('account.groupcreate', {
            url: '/groupcreate',
            templateUrl: 'application/account/groupcreate/groupcreate.html'
        })
        .state('account.groupusers', {
            url: '/groupusers/:id',
            templateUrl: 'application/account/groupusers/groupusers.html'
        })

        // Toolbar Data Views
        .state('toolbar.mydatapage', {
            url: '/mydatapage',
            templateUrl: 'application/toolbar/mydatapage/mydatapage.html'
        })
        .state('toolbar.mydata', {
            url: '/mydata',
            templateUrl: 'application/toolbar/mydata/mydata.html'
        })
        .state('toolbar.thumbnails', {
            url: '/thumbnails',
            templateUrl: 'application/toolbar/thumbnails/thumbnails.html'
        })
        .state('toolbar.dataedit', {
            url:'/dataedit/:id',
            templateUrl: 'application/toolbar/dataedit/dataedit.html'
        })
        .state('toolbar.databytag', {
            url: '/databytag/:name',
            templateUrl: 'application/toolbar/databytag/databytag.html'
        })

        // Toolbar tag views
        .state('toolbar.tagspage', {
            url:'/tagspage',
            templateUrl: 'application/toolbar/tagspage/tagspage.html'
        })
        .state('toolbar.tags', {
            url: '/tags',
            templateUrl: 'application/toolbar/tags/tags.html'
        })
        .state('toolbar.globaltagcloud', {
            url: '/globaltagcloud',
            templateUrl: 'application/toolbar/globaltagcloud/globaltagcloud.html'
        })

        // Toolbar review views
        .state('toolbar.reviews', {
            url: '/reviews',
            templateUrl: 'application/toolbar/reviews/reviews.html'
        })

        // Toolbar machine views
        .state('toolbar.machines', {
            url: '/machines',
            templateUrl: 'application/toolbar/machines/machines.html'
        })

        // Toolbar materials views
        .state('toolbar.materials', {
            url: '/materials',
            templateUrl: 'application/toolbar/materials/materials.html'
        })

        // Toolbar projectspage views
        .state('toolbar.projectspage', {
            url: '/projectspage/:id/:draft_id',
            templateUrl: 'application/toolbar/projectspage/projectspage.html'
        })
        .state('toolbar.projectspage.overview', {
            url: '/overview',
            templateUrl: 'application/toolbar/projectspage/overview/overview.html'
        })
        .state('toolbar.projectspage.provenance', {
            url: '/provenance',
            templateUrl: 'application/toolbar/projectspage/provenance/provenance.html'
        })

        // Views
        .state('mytools', {

        })
        // Projects views
        .state('mytools.projects', {
            url: '/projectspage/:id/:draft_id',
            templateUrl: 'partials/project/projectspage.html'
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
        .state('mytools.processreport', {
            url: '/process/report/:process_id',
            templateUrl: 'partials/process/report.html',
            controller: 'ProcessReportController'
        })
        .state('mytools.tagbyname', {
            url: '/data/bytag/:name',
            templateUrl: 'partials/tags/databytag.html',
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
            url: '/projectspage/process/new',
            templateUrl: 'partials/process.html'
        })
        .state('mytools.provenance', {
            url: '/provenance/:id',
            templateUrl: 'partials/project/add-provenance.html',
            controller: 'ProvenanceController'
        })

        .state('mytools.mytagslist', {
            url: '/mytagslist',
            templateUrl: 'partials/tags/my-tags.html',
            controller: 'MyTagsController'
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
        .state('mytools.machine', {
            url: '/machine',
            templateUrl: 'partials/machine/machines.html',
            controller: 'CreateNewMachineController'
        })
        .state('mytools.material', {
            url: '/material',
            templateUrl: 'partials/material/materials.html',
            controller: 'CreateNewMaterialController'
        })
        .state('account2/create-account', {
            url: '/account/create-account',
            templateUrl: 'partials/account/create-account.html',
            controller: 'CreateAccountController'
        });


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
