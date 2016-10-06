angular.module('materialscommons', []);

var app = angular.module('materialscommons',
    [
        'ngSanitize',
        'ngMessages',
        'ngMaterial',
        'ui',
        'ngCookies',
        'ui.router',
        'restangular',
        'jmdobry.angular-cache',
        'textAngular', 'angularGrid',
        'ngDragDrop', 'ngTagsInput',
        'angular.filter', 'ui.calendar',
        '$strap.directives', 'ui.bootstrap', 'toastr',
        "hljs", "RecursionHelper", 'googlechart',
        'ct.ui.router.extras.core', 'ct.ui.router.extras.transition',
        'ct.ui.router.extras.previous',
        'btford.socket-io',
        'materialscommons']);

app.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

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
            controller: 'LogoutController'
        })
        .state('reviews', {
            url: '/reviews',
            templateUrl: 'application/core/reviews/reviews.html'
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
                Projects: "modelProjects",
                projects: function (Projects) {
                    return Projects.getList();
                }
            }
        })
        .state('projects.create', {
            url: '/create',
            templateUrl: 'application/core/projects/create.html',
            controller: 'CreateProjectController',
            controllerAs: 'project'
        })
        .state('projects.project', {
            url: '/project/:id',
            templateUrl: 'application/core/projects/project/project.html',
            resolve: {
                project: ["$stateParams", "modelProjects", "projects",
                    // Inject projects so that it resolves before looking up the project.
                    function ($stateParams, Projects) {
                        return Projects.get($stateParams.id);
                    }],
                templates: ["processTemplates", "project",
                    function (processTemplates, project) {
                        return processTemplates.templates(project.process_templates, project.id);
                    }]
            },
            onEnter: ["pubsub", "project", function (pubsub) {
                pubsub.send("reviews.change");
            }],
            controller: "ProjectController",
            controllerAs: 'project'
        })
        .state('projects.project.home', {
            url: '/home',
            templateUrl: 'application/core/projects/project/home/home.html',
            controller: "ProjectHomeController",
            controllerAs: "ctrl"
        })
        .state('projects.project.search', {
            url: '/search/:query',
            templateUrl: 'application/core/projects/project/search.html',
            controller: 'SearchController',
            controllerAs: 'search'
        })
        .state("projects.project.files", {
            url: "/files",
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state("projects.project.files.all", {
            url: "/all",
            templateUrl: "application/core/projects/project/files/all.html",
            controller: "FilesAllController",
            controllerAs: 'files'

        })
        .state("projects.project.files.all.edit", {
            url: "/edit/:file_id",
            templateUrl: "application/core/projects/project/files/edit.html",
            controller: "FileEditController",
            controllerAs: 'ctrl',
            resolve: {
                file: ["$stateParams", "projectsService",
                    function ($stateParams, projectsService) {
                        return projectsService.getProjectFile($stateParams.id, $stateParams.file_id);
                    }]
            }
        })
        .state("projects.project.files.all.dir", {
            url: "/dir/:dir_id",
            templateUrl: "application/core/projects/project/files/dir.html",
            controller: "DirController",
            controllerAs: "ctrl"
        })
        .state("projects.project.files.edit", {
            url: "/edit/:file_id",
            templateUrl: "application/core/projects/project/files/edit.html",
            controller: "FileEditController",
            controllerAs: "ctrl",
            resolve: {
                file: ["$stateParams", "projectsService",
                    function ($stateParams, projectsService) {
                        return projectsService.getProjectFile($stateParams.id, $stateParams.file_id);
                    }]
            }
        })
        .state("projects.project.files.search", {
            url: "/search",
            templateUrl: "application/core/projects/project/files/search.html",
            controller: "FilesSearchController",
            controllerAs: "search"
        })
        .state("projects.project.access", {
            url: "/access",
            templateUrl: "application/core/projects/project/access/access.html",
            controller: "ProjectAccessController",
            controllerAs: 'access'
        })
        .state("projects.project.notes", {
            url: "/notes",
            templateUrl: "application/core/projects/project/notes/notes.html",
            controller: "projectNotes",
            controllerAs: 'notes'
        })
        .state("projects.project.sideboard", {
            url: "/sideboard",
            templateUrl: "application/core/projects/project/sideboard/sideboard.html",
            controller: "projectSideboard"
        })
        .state("projects.project.processes", {
            url: "/processes",
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state("projects.project.processes.create", {
            url: "/create/:process/:process_id",
            templateUrl: "application/core/projects/project/processes/create/create.html",
            controller: "CreateProcessController",
            controllerAs: 'ctrl',
            resolve: {
                template: ["$filter", "$stateParams", "templates", "Restangular", "processEdit",
                    function ($filter, $stateParams, templates, Restangular, processEdit) {
                        var t, template;
                        if ($stateParams.process_id) {
                            t = _.find(templates, {name: $stateParams.process});
                            template = t.create();
                            template.name = template.name + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
                            return Restangular.one('process').one('details', $stateParams.process_id).get().then(function (process) {
                                process.name = template.name;
                                var p = processEdit.fillProcess(template, process);
                                p.input_samples = [];
                                p.input_files = [];
                                p.output_files = [];
                                return p;
                            });
                        } else {
                            t = _.find(templates, {name: $stateParams.process});
                            template = t.create();
                            template.name = template.name + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
                            return template;
                        }
                    }
                ]
            }
        })
        .state("projects.project.processes.edit", {
            url: "/edit/:process_id",
            templateUrl: "application/core/projects/project/processes/edit/edit.html",
            controller: "EditProcessController",
            controllerAs: 'ctrl',
            resolve: {
                process: ["$stateParams", "Restangular", "processEdit", "templates",
                    function ($stateParams, Restangular, processEdit, templates) {
                        return Restangular.one('process').one('details', $stateParams.process_id).get().then(function (process) {
                            var t = _.find(templates, {name: process.process_name});
                            var template = t.create();
                            return processEdit.fillProcess(template, process);
                        });
                    }
                ]
            }
        })
        .state("projects.project.processes.list", {
            url: "/list",
            templateUrl: "application/core/projects/project/processes/list.html",
            controller: "projectListProcess",
            controllerAs: "ctrl",
            resolve: {
                processes: ["$stateParams", "projectsService",
                    function ($stateParams, projectsService) {
                        return projectsService.getProjectProcesses($stateParams.id);
                    }]
            }
        })
        .state("projects.project.processes.list.view", {
            url: "/view/:process_id",
            templateUrl: "application/core/projects/project/processes/view.html",
            controller: "projectViewProcess",
            controllerAs: 'view',
            resolve: {
                process: ["$stateParams", "Restangular", "processes",
                    function ($stateParams, Restangular, processes) {
                        var process_id = '';
                        if ($stateParams.process_id) {
                            process_id = $stateParams.process_id;
                        } else {
                            if (processes.length > 0) {
                                process_id = processes[0].id;
                            }
                        }
                        return Restangular.one('process').one('details', process_id).get();
                    }
                ]
            }
        })
        .state("projects.project.processes.view", {
            url: "/view/:process_id",
            templateUrl: "application/core/projects/project/processes/view.html",
            controller: "projectViewProcess",
            controllerAs: 'view',
            resolve: {
                process: ["$stateParams", "Restangular",
                    function ($stateParams, Restangular) {
                        return Restangular.one('process').one('details', $stateParams.process_id).get();
                    }
                ]
            }
        })
        .state('projects.project.samples', {
            url: '/samples',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state("projects.project.samples.list", {
            url: "/list",
            templateUrl: "application/core/projects/project/samples/samples.html",
            controller: "SamplesController",
            controllerAs: "ctrl",
            resolve: {
                samples: ["$stateParams", "projectsService",
                    function ($stateParams, projectsService) {
                        return projectsService.getProjectSamples($stateParams.id);
                    }]
            }
        })
        .state("projects.project.samples.list.edit", {
            url: "/edit/:sample_id",
            templateUrl: "application/core/projects/project/samples/edit.html",
            controller: "SamplesEditController",
            controllerAs: "ctrl",
            resolve: {
                //At this point we have a sample object with properties and best measure.
                // So, to get other measures Restangular call is made
                sample: ["$stateParams", "Restangular", "samples",
                    function ($stateParams, Restangular, samples) {
                        if ($stateParams.sample_id) {
                            var sample_id = $stateParams.sample_id;
                        } else {
                            if (samples.length > 0) {
                                sample_id = samples[0].id;
                            }
                        }
                        return Restangular.one('sample').one('details', sample_id).get();
                    }
                ]
            }
        })
        .state('projects.project.samples.edit', {
            url: '/edit/:sample_id',
            templateUrl: "application/core/projects/project/samples/edit.html",
            controller: "SamplesEditController",
            controllerAs: "ctrl",
            resolve: {
                //At this point we have a sample object with properties and best measure.
                // So, to get other measures Restangular call is made
                sample: ["$stateParams", "Restangular",
                    function ($stateParams, Restangular) {
                        return Restangular.one('sample').one('details', $stateParams.sample_id).get();
                    }
                ]
            }
        })
        .state("projects.project.reviews", {
            url: "/reviews",
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state("projects.project.reviews.list", {
            url: "/list",
            templateUrl: "application/core/projects/project/reviews/reviews.html",
            controller: "projectReviews",
            controllerAs: "ctrl",
            resolve: {
                reviews: ["project",
                    function (project) {
                        return project.reviews;
                    }]
            }
        })
        .state("projects.project.reviews.list.view", {
            url: "/view/:review_id",
            templateUrl: "application/core/projects/project/reviews/view.html",
            controller: "projectViewReview",
            controllerAs: "ctrl",
            resolve: {
                review: ["$stateParams", "Restangular",
                    function ($stateParams, Restangular) {
                        return Restangular.one('review').one('details', $stateParams.review_id).get();
                    }
                ]
            }
        })
        .state("projects.project.reviews.list.create", {
            url: "/reviews/create",
            templateUrl: "application/core/projects/project/reviews/create.html",
            controller: "projectCreateReview",
            controllerAs: "ctrl"
        });

    $urlRouterProvider.otherwise('/home');
}]);

app.run(["$rootScope", "User", "Restangular", "socketFactory", appRun]);

function appRun($rootScope, User, Restangular, socketFactory) {
    Restangular.setBaseUrl(mcglobals.apihost);

    // appRun will run when the application starts up and before any controllers have run.
    // This means it will run on a refresh. We check if the user is already authenticated
    // during the run. If they are then the browser has been refreshed and we need to
    // set the apikey param for Restangular. This param is set in the login-controller.
    // However on a refresh the login-controller isn't run so we need to explicitly set
    // the apikey param in Restangular.
    if (User.isAuthenticated()) {
        Restangular.setDefaultRequestParams({apikey: User.apikey()});
    }

    if (false) {
        var socket = socketFactory();
        socket.forward('connect');
        socket.forward('event');
        socket.forward('disconnect');
        socket.forward('reconnect');
        socket.forward('event');
    }

    $rootScope.$on('$stateChangeStart', function () {
        if (User.isAuthenticated()) {
            $rootScope.email_address = User.u();
        }
    });
}
