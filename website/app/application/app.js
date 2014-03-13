var Application = Application || {};

Application.Constants = angular.module('application.core.constants', []);
Application.Services = angular.module('application.core.services', []);
Application.Controllers = angular.module('application.core.controllers', []);
Application.Filters = angular.module('application.core.filters', []);
Application.Directives = angular.module('application.core.directives', []);

Application.Provenance = {};
Application.Provenance.Constants = angular.module('application.provenance.constants', []);
Application.Provenance.Services = angular.module('application.provenance.services', []);
Application.Provenance.Controllers = angular.module('application.provenance.controllers', []);
Application.Provenance.Filters = angular.module('application.provenance.filters', []);
Application.Provenance.Directives = angular.module('application.provenance.directives', []);

var app = angular.module('materialscommons',
    [
        'ui',
        'ui.bootstrap',
        'ngCookies',
        'ui.router',
        'ngQuickDate',
        'btford.socket-io',
        'restangular',
        'jmdobry.angular-cache',
        'application.core.constants', 'application.core.services', 'application.core.controllers',
        'application.core.filters', 'application.core.directives',
        'application.provenance.constants', 'application.provenance.services', 'application.provenance.controllers',
        'application.provenance.filters', 'application.provenance.directives']);

// This factory needs to hang off of this module for some reason
app.factory('msocket', ["socketFactory", function (socketFactory) {
    var msocket = socketFactory({
        ioSocket: io.connect('https://localhost:8082')
    });
    msocket.forward('file');
    msocket.forward('connect');
    msocket.forward('disconnect');
    msocket.forward('error');
    return msocket;
}]);

app.config(["$stateProvider", function ($stateProvider) {
    mcglobals = {};
    doConfig();
    $stateProvider
        // Navbar
        .state('home', {
            url: '/home',
            templateUrl: 'application/core/home/home.html'
        })
        .state('toolbar', {
            url: '/toolbar',
            templateUrl: 'application/core/toolbar/toolbar.html'
        })
        .state('about', {
            url: '/about',
            templateUrl: 'application/core/about/about.html'
        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'application/core/contact/contact.html'
        })
        .state('help', {
            url: '/help',
            templateUrl: 'application/core/help/help.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'application/core/login/login.html'
        })
        .state('logout', {
            url: '/logout',
            controller: 'logout'
        })

        // Account
        .state('account', {
            url: '/account',
            templateUrl: 'application/core/account/account.html'
        })
        .state('account.groupcreate', {
            url: '/groupcreate',
            templateUrl: 'application/core/account/groupcreate/groupcreate.html'
        })
        .state('account.groupusers', {
            url: '/groupusers/:id',
            templateUrl: 'application/core/account/groupusers/groupusers.html'
        })
        // Toolbar drafts
        .state('toolbar.drafts', {
            url: '/drafts',
            templateUrl: 'application/core/toolbar/drafts/drafts.html'
        })
        // Toolbar Data Views
        .state('toolbar.mydatapage', {
            url: '/mydatapage',
            templateUrl: 'application/core/toolbar/mydatapage/mydatapage.html'
        })
        .state('toolbar.mydata', {
            url: '/mydata',
            templateUrl: 'application/core/toolbar/mydata/mydata.html'
        })
        .state('toolbar.thumbnails', {
            url: '/thumbnails',
            templateUrl: 'application/core/toolbar/thumbnails/thumbnails.html'
        })
        .state('toolbar.dataedit', {
            url: '/dataedit/:id',
            templateUrl: 'application/core/toolbar/dataedit/dataedit.html'
        })
        .state('toolbar.databytag', {
            url: '/databytag/:name',
            templateUrl: 'application/core/toolbar/databytag/databytag.html'
        })

        // Toolbar tag views
        .state('toolbar.tagspage', {
            url: '/tagspage',
            templateUrl: 'application/core/toolbar/tagspage/tagspage.html'
        })
        .state('toolbar.tags', {
            url: '/tags',
            templateUrl: 'application/core/toolbar/tags/tags.html'
        })
        .state('toolbar.globaltagcloud', {
            url: '/globaltagcloud',
            templateUrl: 'application/core/toolbar/globaltagcloud/globaltagcloud.html'
        })

        // Toolbar review views
        .state('toolbar.reviews', {
            url: '/reviews',
            templateUrl: 'application/core/toolbar/reviews/reviews.html'
        })

        // Toolbar machine views
        .state('toolbar.machines', {
            url: '/machines',
            templateUrl: 'application/core/toolbar/machines/machines.html'
        })

        // Toolbar materials views
//        .state('toolbar.materials', {
//            url: '/materials',
//            templateUrl: 'application/core/toolbar/materials/materials.html'
//        })

        // Toolbar materials views
        .state('toolbar.samples', {
            url: '/samples',
            templateUrl: 'application/core/toolbar/samples/samples.html'
        })

        // Toolbar overview
        .state('toolbar.overview', {
            url: '/overview',
            templateUrl: 'application/core/toolbar/overview/overview.html'
        })

        // Toolbar projectspage views
        .state('toolbar.projectspage', {
            url: '/projectspage/:id/:draft_id',
            templateUrl: 'application/core/toolbar/projectspage/projectspage.html',
            resolve: {
                ProvDrafts: "ProvDrafts"
            },
            onExit: function (ProvDrafts) {
                if (ProvDrafts.current && ProvDrafts.current.attributes.process.name !== "") {
                    ProvDrafts.saveDraft();
                }
            }
        })
        .state('toolbar.projectspage.overview', {
            url: '/overview',
            templateUrl: 'application/core/toolbar/projectspage/overview/overview.html'
        })
        .state('toolbar.projectspage.provenance', {
            url: '/provenance',
            templateUrl: 'application/provenance/provenance.html'
        })
        .state('toolbar.projectspage.provenance.process', {
            url: '/process',
            templateUrl: 'application/provenance/process/process.html'

        })
        .state('toolbar.projectspage.provenance.iosteps', {
            url: '/iosteps:iosteps',
            templateUrl: 'application/provenance/iosteps/iosteps.html'
        })
        .state('toolbar.projectspage.provenance.iosteps.iostep', {
            url: '/iostep:iostep',
            templateUrl: 'application/provenance/iosteps/iostep/iostep.html'
        })
        .state('toolbar.projectspage.provenance.iosteps.files', {
            url: '/files:iostep',
            templateUrl: 'application/provenance/iosteps/files/files.html'
        })
        .state('toolbar.projectspage.provenance.finish', {
            url: '/finish',
            templateUrl: 'application/provenance/finish/finish.html'
        })
        // File services
        .state('toolbar.fileservices', {
            url: '/fileservices',
            templateUrl: 'application/core/toolbar/fileservices/fileservices.html'
        })
        .state('toolbar.fileservices.projects', {
            url: '/projects',
            templateUrl: 'application/core/toolbar/fileservices/projects/projects.html'
        })
        .state('toolbar.fileservices.events', {
            url: '/events',
            templateUrl: 'application/core/toolbar/fileservices/events/events.html'
        })
        .state('toolbar.fileservices.config', {
            url: '/config',
            templateUrl: 'application/core/toolbar/fileservices/config/config.html'
        });
}]);

app.run(["$rootScope", "User", function ($rootScope, User) {
    $rootScope.$on('$stateChangeStart', function () {
        if (User.isAuthenticated()) {
            $rootScope.email_address = User.u();
        }
    });
}]);
