var Application = Application || {};

Application.Constants = angular.module('application.core.constants', []);
Application.Services = angular.module('application.core.services', []);
Application.Controllers = angular.module('application.core.controllers', []);
Application.Filters = angular.module('application.core.filters', []);
Application.Directives = angular.module('application.core.directives', []);
//
//Application.Provenance = {};
//Application.Provenance.Constants = angular.module('application.provenance.constants', []);
//Application.Provenance.Services = angular.module('application.provenance.services', []);
//Application.Provenance.Controllers = angular.module('application.provenance.controllers', []);
//Application.Provenance.Filters = angular.module('application.provenance.filters', []);
//Application.Provenance.Directives = angular.module('application.provenance.directives', []);

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
        'application.core.filters', 'application.core.directives']);

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
        .state('reviews', {
            url: '/reviews',
            templateUrl: 'application/core/reviews/reviews.html'
        })
        .state('machines', {
            url: '/machines',
            templateUrl: 'application/core/machines/machines.html'
        })

        /*
         ########################################################################
         ####################### Account ##################################
         ########################################################################
         */
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

        /*
         ########################################################################
         ####################### Projects Overview ##################################
         ########################################################################
         */
        .state('projects', {
            url: '/projects/:id/:draft_id/:from',
            templateUrl: 'application/core/projects/projectspage.html'
        })
        .state('projects.overview', {
            url: '/overview',
            templateUrl: 'application/core/projects/overview/overview.html'
        })
        .state('projects.overview.files', {
            url: '/files',
            templateUrl: 'application/core/projects/overview/files/files.html'
        })
        .state('projects.overview.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/projects/overview/provenance/provenance.html'
        })
        .state('projects.overview.drafts', {
            url: '/drafts',
            templateUrl: 'application/core/projects/overview/drafts/drafts.html'
        })
        .state('projects.overview.samples', {
            url: '/samples',
            templateUrl: 'application/core/projects/overview/samples/samples.html'
        })

        /*
         ########################################################################
         ####################### Projects Data Edit ##################################
         ########################################################################
         */
        .state('projects.dataedit', {
            url: '/dataedit/:data_id/:file_path',
            templateUrl: 'application/core/projects/dataedit/dataedit.html'
        })
        .state('projects.dataedit.details', {
            url: '/details',
            templateUrl: 'application/core/projects/dataedit/details/details.html'
        })
        .state('projects.dataedit.reviews', {
            url: '/reviews',
            templateUrl: 'application/core/projects/dataedit/reviews/reviews.html'
        })
        .state('projects.dataedit.notes', {
            url: '/notes',
            templateUrl: 'application/core/projects/dataedit/notes/notes.html'
        })
        .state('projects.dataedit.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/projects/dataedit/provenance/provenance.html'
        })
        /*
         ########################################################################
         ####################### Projects Provenance ##################################
         ########################################################################
         */
        .state('projects.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/projects/provenance/provenance.html',
            resolve: {
                ProvDrafts: "ProvDrafts"
            },
            onExit: function (ProvDrafts) {
                if (ProvDrafts.current && ProvDrafts.current.process.name !== "") {
                    ProvDrafts.saveDraft();
                }
            }
        })
        .state('projects.provenance.process', {
            url: '/process',
            templateUrl: 'application/core/projects/provenance/process/process.html'
        })
        .state('projects.provenance.iosteps', {
            url: '/iosteps:iosteps',
            templateUrl: 'application/core/projects/provenance/iosteps/iosteps.html'
        })
        .state('projects.provenance.iosteps.iostep', {
            url: '/name:stepname/value:stepvalue',
            templateUrl: 'application/core/projects/provenance/iosteps/iostep/iostep.html'
        })
        .state('projects.provenance.iosteps.files', {
            url: '/files:iostep',
            templateUrl: 'application/core/projects/provenance/iosteps/files/files.html',
            onEnter: function (pubsub) {
                pubsub.send("project.tree", true);
            },
            onExit: function (pubsub) {
                pubsub.send("project.tree", false);
            }
        })
        .state('projects.provenance.finish', {
            url: '/finish',
            templateUrl: 'application/core/projects/provenance/finish/finish.html'
        })

}]);

app.run(["$rootScope", "User", function ($rootScope, User) {
    $rootScope.$on('$stateChangeStart', function () {
        if (User.isAuthenticated()) {
            $rootScope.email_address = User.u();
        }
    });
}]);
