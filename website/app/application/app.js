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
        'ngCookies',
        'ui.router',
//        'ngQuickDate',
        'btford.socket-io',
        'restangular',
        'jmdobry.angular-cache',
        'validation',
        'textAngular',
        'treeGrid',
        'ngDragDrop',
        '$strap.directives', 'ui.bootstrap',
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

app.config(["$stateProvider", "$validationProvider", function ($stateProvider, $validationProvider) {

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
        .state('modal', {
            url: '/modal',
            templateUrl: 'application/core/modal/test.html'
        })
        .state('sub', {
            url: '/sub',
            templateUrl: 'application/core/modal/sub.html'
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
        .state('account.password', {
            url: '/password',
            templateUrl: 'application/core/account/password/password.html'
        })
        .state('account.apikey', {
            url: '/apikey',
            templateUrl: 'application/core/account/apikey/apikey.html'
        })
        .state('account.usergroup', {
            url: '/usergroup',
            templateUrl: 'application/core/account/usergroups/usergroup.html'
        })
        .state('account.usergroup.users', {
            url: '/users/:id',
            templateUrl: 'application/core/account/usergroups/users.html'
        })
        .state('account.templates', {
            url: '/templates',
            templateUrl: 'application/core/account/templates/templates.html'
        })
        .state('toolbar.thumbnails', {
            url: '/thumbnails',
            templateUrl: 'application/core/toolbar/thumbnails/thumbnails.html'
        })
        .state('toolbar.process', {
            url: '/process/:id',
            templateUrl: 'application/core/toolbar/process/process.html'
        })
        .state('toolbar.process.notes', {
            url: '/notes',
            templateUrl: 'application/core/toolbar/process/notes/notes.html'
        })
        .state('toolbar.process.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/toolbar/process/provenance/provenance.html'
        })
        .state('toolbar.process.tags', {
            url: '/tags',
            templateUrl: 'application/core/toolbar/process/tags/tags.html'
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
        // Toolbar overview
        .state('toolbar.overview', {
            url: '/overview',
            templateUrl: 'application/core/toolbar/overview/overview.html'
        })
        /*
         #######################################################################
         ####################### Project page views
         ########################################################################
         */
        .state('toolbar.projectspage', {
            url: '/projectspage/:id/:draft_id/:from',
            templateUrl: 'application/core/toolbar/projectspage/projectspage.html',
            resolve: {
                ProvDrafts: "ProvDrafts"
            },
            onExit: function (ProvDrafts) {
                if (ProvDrafts.current && ProvDrafts.current.process.name !== "") {
                    ProvDrafts.saveDraft();
                }
            }
        })
        .state('toolbar.projectspage.overview', {
            url: '/overview',
            templateUrl: 'application/core/toolbar/projectspage/overview/overview.html'
        })
        .state('toolbar.projectspage.overview.files', {
            url: '/files',
            templateUrl: 'application/core/toolbar/projectspage/overview/files/files.html'
        })
        .state('toolbar.projectspage.overview.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/toolbar/projectspage/overview/provenance/provenance.html'
        })
        .state('toolbar.projectspage.overview.drafts', {
            url: '/drafts',
            templateUrl: 'application/core/toolbar/projectspage/overview/drafts/drafts.html'
        })
        .state('toolbar.projectspage.overview.samples', {
            url: '/samples',
            templateUrl: 'application/core/toolbar/projectspage/overview/samples/samples.html'
        })

        /*
         ########################################################################
         ####################### Data page views ################################
         ########################################################################
         */
        .state('toolbar.projectspage.dataedit', {
            url: '/dataedit/:data_id/:file_path',
            templateUrl: 'application/core/toolbar/projectspage/dataedit/dataedit.html'
        })
        .state('toolbar.projectspage.dataedit.details', {
            url: '/details',
            templateUrl: 'application/core/toolbar/projectspage/dataedit/details/details.html'
        })
        .state('toolbar.projectspage.dataedit.reviews', {
            url: '/reviews',
            templateUrl: 'application/core/toolbar/projectspage/dataedit/reviews/reviews.html'
        })
        .state('toolbar.projectspage.dataedit.notes', {
            url: '/notes',
            templateUrl: 'application/core/toolbar/projectspage/dataedit/notes/notes.html'
        })
        .state('toolbar.projectspage.dataedit.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/toolbar/projectspage/dataedit/provenance/provenance.html'
        })
        /*
         ########################################################################
         ####################### Provenance Creation ############################
         ########################################################################
         */
        .state('toolbar.projectspage.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/toolbar/projectspage/provenance/provenance.html'
        })
        .state('toolbar.projectspage.provenance.process', {
            url: '/process',
            templateUrl: 'application/core/toolbar/projectspage/provenance/process/process.html'

        })
        .state('toolbar.projectspage.provenance.iosteps', {
            url: '/iosteps:iosteps',
            templateUrl: 'application/core/toolbar/projectspage/provenance/iosteps/iosteps.html'
        })
        .state('toolbar.projectspage.provenance.iosteps.iostep', {
            url: '/name:stepname/value:stepvalue',
            templateUrl: 'application/core/toolbar/projectspage/provenance/iosteps/iostep/iostep.html'
        })
        .state('toolbar.projectspage.provenance.iosteps.files', {
            url: '/files:iostep',
            templateUrl: 'application/core/toolbar/projectspage/provenance/iosteps/files/files.html',
            onEnter: function (pubsub) {
                pubsub.send("project.tree", true);
            },
            onExit: function (pubsub) {
                pubsub.send("project.tree", false);
            }
        })
        .state('toolbar.projectspage.provenance.finish', {
            url: '/finish',
            templateUrl: 'application/core/toolbar/projectspage/provenance/finish/finish.html'
        })
        /*
         ########################################################################
         ####################### File Services ##################################
         ########################################################################
         */
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
        })
        .state('toolbar.projects', {
            url: '/projects',
            templateUrl: 'application/core/toolbar/projects/projects.html'
        })
        /*
         ########################################################################
         ####################### Reviews ##################################
         ########################################################################
         */
        .state('reviews', {
            url: '/reviews',
            templateUrl: 'application/core/reviews/reviews.html'
        })
        /*
         ########################################################################
         ####################### Machines ##################################
         ########################################################################
         */
        .state('machines', {
            url: '/machines',
            templateUrl: 'application/core/machines/machines.html'
        })

}]);

app.run(["$rootScope", "User", function ($rootScope, User) {
    $rootScope.$on('$stateChangeStart', function () {
        if (User.isAuthenticated()) {
            $rootScope.email_address = User.u();
        }
    });
}]);
