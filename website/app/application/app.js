var Application = Application || {};

Application.Constants = angular.module('application.core.constants', []);
Application.Services = angular.module('application.core.services', []);
Application.Controllers = angular.module('application.core.controllers', []);
Application.Filters = angular.module('application.core.filters', []);
Application.Directives = angular.module('application.core.directives', []);

var app = angular.module('materialscommons',
                         [
                             'ui',
                             'ngCookies',
                             'ui.router',
                             'btford.socket-io',
                             'restangular',
                             'jmdobry.angular-cache',
                             'validation', 'validation.rule',  'wu.masonry',
                             'textAngular',
                             'treeGrid',
                             'ngDragDrop',
                             'ng-context-menu',
                             "cfp.hotkeys",
                             '$strap.directives', 'ui.bootstrap', 'toastr',
                             'tc.chartjs',
                             'application.core.constants', 'application.core.services',
                             'application.core.controllers',
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
     ########################### Projects ###################################
     ########################################################################
     */
        .state('projects', {
            url: '/projects',
            abstract: true,
            template: '<div ui-view></div>',
            resolve: {
                Projects: "model.projects",
                projects: function (Projects) {
                    return Projects.getList();
                },

                Templates: "model.templates",
                templates: function(Templates) {
                    return Templates.getList();
                }
            }
        })
        .state('projects.project', {
            url: '/project/:id',
            templateUrl: 'application/core/projects/project/project.html',
            resolve: {
                project: ["$stateParams", "model.projects", "projects", "templates",
                          function ($stateParams, Projects, projects, templates) {
                              // We use templates as a dependency so that they are all loaded
                              // before getting to this step. Otherwise the order of items
                              // being resolved isn't in the order we need them.
                              return Projects.get($stateParams.id);
                          }]
            },
            onEnter: ["pubsub", "project", function(pubsub, project) {
                pubsub.send("reviews.change");
            }],
            controller: "projectsProject"
        })
        .state('projects.project.home', {
            url: '/home',
            templateUrl: 'application/core/projects/project/home/home.html',
            controller: "projectHome"
        })
        .state('projects.project.samples', {
            url: '/samples',
            templateUrl: 'application/core/projects/project/samples/samples.html',
            controller: "projectSamples"
        })
        .state('projects.project.samples.overview', {
            url: '/overview',
            templateUrl: "application/core/projects/project/samples/overview.html",
            controller: "projectSamplesOverview"
        })
        .state('projects.project.samples.create', {
            url: '/create/:sid',
            templateUrl: 'application/core/projects/project/samples/create.html',
            controller: "projectSamplesCreate"
        })
        .state('projects.project.tasks', {
            url: '/tasks',
            templateUrl: 'application/core/projects/project/tasks/tasks.html',
            controller: "projectTasks"
        })
        .state('projects.project.tasks.overview', {
            url: '/overview',
            templateUrl: "application/core/projects/project/tasks/overview.html",
            controller: "projectTasksOverview"
        })
        .state('projects.project.tasks.create', {
            url: '/create/:sid',
            templateUrl: 'application/core/projects/project/tasks/create.html',
            controller: "projectTasksCreate"
        })
        .state('projects.project.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/projects/project/provenance/provenance.html',
            controller: "projectProvenance"
        })
        .state('projects.project.provenance.overview', {
            url: '/overview/:index',
            templateUrl: 'application/core/projects/project/provenance/overview.html',
            controller: 'projectProvenanceOverview'
        })
        .state('projects.project.provenance.create', {
            url: '/create/:sid',
            templateUrl: 'application/core/projects/project/provenance/create.html',
            controller: "projectProvenanceCreate"
        })
        .state('projects.project.provenance.drafts', {
            url: '/drafts',
            templateUrl: 'application/core/projects/project/provenance/drafts.html',
            controller: "projectProvenanceDrafts"
        })
        .state('projects.project.reviews', {
            url: '/reviews',
            templateUrl: 'application/core/projects/project/reviews/reviews.html',
            controller: "projectReviews"
        })
        .state('projects.project.reviews.overview', {
            url: "/overview",
            templateUrl: "application/core/projects/project/reviews/overview.html",
            controller: "projectReviewsOverview"
        })
        .state('projects.project.reviews.create', {
            url: "/create/:sid",
            templateUrl: "application/core/projects/project/reviews/create.html",
            controller: "projectReviewsCreate"
        })
        .state('projects.project.notes', {
            url: '/notes',
            templateUrl: 'application/core/projects/project/notes/notes.html',
            controller: "projectNotes"
        })
        .state('projects.project.notes.overview', {
            url: '/overview',
            templateUrl: "application/core/projects/project/notes/overview.html",
            controller: "projectNotesOverview"
        })
        .state('projects.project.notes.edit', {
            url: '/edit/:index',
            templateUrl: "application/core/projects/project/notes/edit.html",
            controller: "projectNotesEdit"
        })
        .state('projects.project.notes.create', {
            url: '/create/:sid',
            templateUrl: "application/core/projects/project/notes/create.html",
            controller: "projectNotesCreate"
        })
        .state('projects.project.files', {
            url: "/files",
            templateUrl: "application/core/projects/project/files/files.html",
            controller: "projectFiles"
        })
        .state('projects.project.files.overview', {
            url: "/overview",
            templateUrl: "application/core/projects/project/files/overview.html",
            controller: "projectFilesOverview"
        })
        .state('projects.project.files.view', {
            url: "/view/:fileid",
            templateUrl: "application/core/projects/project/files/view.html",
            controller: "projectFilesViewFile"
        })
        .state('projects.project.tags', {
            url: '/tags',
            templateUrl: "application/core/projects/project/tags/tags.html",
            controller: "projectTags"
        })
        .state('projects.project.tags.create', {
            url: '/create/:sid',
            templateUrl: "application/core/projects/project/tags/create.html",
            controller: "projectTagsCreate"
        });

    $validationProvider.setErrorHTML(function (msg) {
        return '<span class="validation-invalid">' + msg + '</span>';
    });

    $validationProvider.setSuccessHTML(function (msg) {
        return '<span class="validation-valid">' + msg + '</span>';
    });

}]);

app.run(["$rootScope", "User", "Restangular", "recent", "ui", appRun]);

function appRun($rootScope, User, Restangular, recent, ui) {
    Restangular.setBaseUrl(mcglobals.apihost);

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        if (User.isAuthenticated()) {
            $rootScope.email_address = User.u();
            ui.setShowFiles(toParams.id, false);
        }
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        var projectID = fromParams.id;
        if (!fromState.abstract) {
            recent.pushLast(projectID, "ignore", fromState.name, fromParams);
        }
    });
}
