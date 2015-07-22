var Application = Application || {};

Application.Constants = angular.module('application.core.constants', []);
Application.Services = angular.module('application.core.services', []);
Application.Controllers = angular.module('application.core.controllers', []);
Application.Filters = angular.module('application.core.filters', []);
Application.Directives = angular.module('application.core.directives', []);

var app = angular.module('materialscommons',
    [
        'ngAnimate',
        'ngSanitize',
        'ngMessages',
        'ui',
        'highcharts-ng',
        'ngCookies',
        'ui.router',
        'ngHandsontable',
        'btford.socket-io',
        'restangular',
        'jmdobry.angular-cache',
        'validation', 'validation.rule', 'wu.masonry',
        'textAngular', 'angularGrid',
        'ngDragDrop', 'ngTagsInput',
        'ng-context-menu', "cfp.hotkeys", 'angular.filter', 'ui.calendar',
        '$strap.directives', 'ui.bootstrap', 'toastr',
        "hljs", "nsPopover", "RecursionHelper",
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

app.config(["$stateProvider", "$validationProvider", "$urlRouterProvider", function ($stateProvider, $validationProvider, $urlRouterProvider) {

    mcglobals = {};
    doConfig();
    $stateProvider
        // Navbar
        .state('home', {
            url: '/home',
            templateUrl: 'application/core/splash.html'
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
        .state('account.settings', {
            url: '/settings',
            templateUrl: 'application/core/account/settings/settings.html'
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
                templates: function (Templates) {
                    return Templates.getList();
                }
            }
        })
        .state('projects.create', {
            url: '/create',
            templateUrl: 'application/core/projects/create.html',
            controller: 'projectsCreate'
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
            onEnter: ["pubsub", "project", function (pubsub, project) {
                pubsub.send("reviews.change");
            }],
            controller: "projectsProject"
        })
        .state('projects.project.home', {
            url: '/home',
            templateUrl: 'application/core/projects/project/home/home.html',
            controller: "projectHome"
        })
        .state("projects.project.new-wizard", {
            url: "/new-wizard",
            templateUrl: "application/core/projects/project/provenance/wizard/wizard.html",
            controller: "provWizardController"
        })
        .state("projects.project.new-wizard.node-details", {
            url: "/node-details/:node_id",
            templateUrl: "application/core/projects/project/provenance/wizard/node-details.html",
            controller: "nodeDetailsController"
        })
        .state("projects.project.new-wizard.edge-details", {
            url: "/edge-details/:edge_id",
            templateUrl: "application/core/projects/project/provenance/wizard/edge-details.html",
            controller: "edgeDetailsController"
        })
        .state("projects.project.new-wizard.templates", {
            url: "/templates",
            templateUrl: "application/core/projects/project/provenance/wizard/templates.html",
            controller: "chooseTemplateController"
        })
        .state("projects.project.new-wizard.create-process", {
            url: "/create/:template_id",
            templateUrl: "application/core/projects/project/provenance/wizard/create.html",
            controller: "createProvenanceFromTemplate",
            resolve: {
                template: ["templates", "$stateParams", "templateConstructer",
                    function (templates, $stateParams, templateConstructer) {
                        var index = _.indexOf(templates, function (template) {
                            return template.id === $stateParams.template_id;
                        });
                        return index === -1 ? {} : templateConstructer.constructTemplate(templates[index]);
                    }]
            }
        })
        .state("projects.project.new-wizard.create-process.edit", {
            url: "/edit/:section/:category/:attribute",
            templateUrl: "application/core/projects/project/provenance/wizard/edit.html",
            controller: "createProvenanceEdit",
            resolve: {
                section: ["template", "$stateParams", function (template, $stateParams) {
                    var index = _.indexOf(template.sections, function (section) {
                        return section.name === $stateParams.section;
                    });
                    return template.sections[index];
                }],
                category: ["section", "$stateParams", function (section, $stateParams) {
                    var index = _.indexOf(section.categories, function (category) {
                        return category.category === $stateParams.category;
                    });
                    return section.categories[index];
                }],

                attribute: ["category", "$stateParams", function (category, $stateParams) {
                    if ($stateParams.attribute) {
                        var index = _.indexOf(category.attributes, function (attribute) {
                            return attribute.attribute === $stateParams.attribute;
                        });
                        return category.attributes[index];
                    } else {
                        return false;
                    }
                }]
            }
        })
        .state("projects.project.provenance", {
            url: "/provenance/:item_id/:prov_type",
            templateUrl: "application/core/projects/project/provenance/new/provenance.html",
            controller: "projectProvenanceController"
        })
        .state("projects.project.files", {
            url: "/files",
            templateUrl: "application/core/projects/project/files/files.html",
            controller: "FilesController"
        })
        .state("projects.project.files.edit", {
            url: "/edit/:file_id",
            templateUrl: "application/core/projects/project/files/edit.html",
            controller: "FilesEditController"
        })
        .state("projects.project.access", {
            url: "/access",
            templateUrl: "application/core/projects/project/access/access.html",
            controller: "projectAccess"
        })
        .state("projects.project.drafts", {
            url: "/drafts",
            templateUrl: "application/core/projects/project/drafts/drafts.html",
            controller: "projectDrafts"
        })
        .state("projects.project.reviews", {
            url: "/reviews/:category",
            templateUrl: "application/core/projects/project/reviews/reviews.html",
            controller: "projectReviews"
        })
        .state("projects.project.reviews.edit", {
            url: "/edit/:review_id",
            templateUrl: "application/core/projects/project/reviews/edit.html",
            controller: "projectEditReview"
        })
        .state("projects.project.reviews.create", {
            url: "/reviews/create",
            templateUrl: "application/core/projects/project/reviews/create.html",
            controller: "projectCreateReview"
        })
        .state("projects.project.notes", {
            url: "/notes",
            templateUrl: "application/core/projects/project/notes/notes.html",
            controller: "projectNotes"
        })
        .state("projects.project.sideboard", {
            url: "/sideboard",
            templateUrl: "application/core/projects/project/sideboard/sideboard.html",
            controller: "projectSideboard"
        })
        .state("projects.project.processes", {
            url: "/processes",
            templateUrl: "application/core/projects/project/processes/processes.html",
            controller: "projectProcesses",
            controllerAs: 'processes'
        })
        .state("projects.project.processes.list", {
            url: "/list",
            templateUrl: "application/core/projects/project/processes/list.html",
            controller: "projectListProcess"
        })
        .state("projects.project.processes.create", {
            url: "/create",
            templateUrl: "application/core/projects/project/processes/create.html",
            controller: "projectCreateProcess"
        })
        .state("projects.project.processes.list.edit", {
            url: "/edit/:process_id",
            templateUrl: "application/core/projects/project/processes/edit.html",
            controller: "projectEditProcess"
        })
        .state("projects.project.samples", {
            url: "/samples/:category",
            templateUrl: "application/core/projects/project/samples/samples.html",
            controller: "projectSamples"
        })
        .state("projects.project.samples.create", {
            url: "/samples/create",
            templateUrl: "application/core/projects/project/samples/create.html",
            controller: "projectSamplesCreate"
        })
        .state("projects.project.samples.edit", {
            url: "/edit/:sample_id",
            templateUrl: "application/core/projects/project/samples/edit.html",
            controller: "projectEditSample"
        });

    $urlRouterProvider.otherwise('/home');
    createNumericValidator($validationProvider);
    $validationProvider.showSuccessMessage = false;
    $validationProvider.setErrorHTML(function (msg) {
        return '<span class="validation-invalid">' + msg + '</span>';
    });

    $validationProvider.setSuccessHTML(function (msg) {
        return '<span class="validation-valid">' + msg + '</span>';
    });

}]);

function createNumericValidator(validationProvider) {
    var expression = {
        numeric: /^[0-9]*\.?[0-9]+$/
    };

    var validationMsgs = {
        numeric: {
            error: "Invalid numeric value",
            success: ""
        }
    };

    validationProvider.setExpression(expression).setDefaultMsg(validationMsgs);
}

app.run(["$rootScope", "User", "Restangular", "pubsub", "recent", appRun]);

function appRun($rootScope, User, Restangular, pubsub, recent) {
    Restangular.setBaseUrl(mcglobals.apihost);

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        if (User.isAuthenticated()) {
            $rootScope.email_address = User.u();
        }
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        var projectID = fromParams.id;
        if (!fromState.abstract) {
            recent.pushLast(projectID, "ignore", fromState.name, fromParams);
        }

        pubsub.send("breadcrumbs", toState.name);
    });
}
