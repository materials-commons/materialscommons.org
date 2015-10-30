angular.module('materialscommons', []);

var app = angular.module('materialscommons',
    [
        'ngSanitize',
        'ngMessages',
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
                project: ["$stateParams", "model.projects", "projects",
                    function ($stateParams, Projects) {
                        // We use templates as a dependency so that they are all loaded
                        // before getting to this step. Otherwise the order of items
                        // being resolved isn't in the order we need them.
                        return Projects.get($stateParams.id);
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
            controllerAs: "home"
        })
        .state('projects.project.search', {
            url: '/search/:query',
            templateUrl: 'application/core/projects/project/search.html',
            controller: 'SearchController',
            controllerAs: 'search'
        })
        .state("projects.project.files", {
            url: "/files",
            templateUrl: "application/core/projects/project/files/files.html",
            controller: "FilesController",
            controllerAs: "files"
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
                file: ["$stateParams", "Restangular",
                    function ($stateParams, Restangular) {
                        return Restangular.one('v2').one('projects', $stateParams.id).
                            one('files', $stateParams.file_id).get();
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
                file: ["$stateParams", "Restangular",
                function ($stateParams, Restangular) {
                    return Restangular.one('v2').one('projects', $stateParams.id).
                        one('files', $stateParams.file_id).get();
                }]
            }
        })
        .state("projects.project.files.images", {
            url: "/images",
            templateUrl: "application/core/projects/project/files/images.html",
            controller: "FilesImagesController"
        })
        .state("projects.project.files.types", {
            url: "/types",
            templateUrl: "application/core/projects/project/files/types.html",
            controller: "FilesByTypeController"
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
            templateUrl: "application/core/projects/project/processes/processes.html",
            controller: "projectProcesses",
            controllerAs: 'ctrl'
            //resolve: {
            //    processes: ["project",
            //        function (project) {
            //            return project.processes;
            //        }]
            //}
        })
        .state("projects.project.processes.create", {
            url: "/create",
            templateUrl: "application/core/projects/project/processes/create/create.html",
            controller: "CreateProcessController",
            controllerAs: 'ctrl',
            resolve: {
                template: ["processList", "processTemplates", "$filter", "measurements",
                    function (processList, processTemplates, $filter, measurements) {
                        var template = processTemplates.getActiveTemplate();
                        template.name = template.name + ' - ' + $filter('date')(new Date(), 'MM/dd/yyyy @ h:mma');
                        measurements.templates();
                        return template;
                    }
                ]
                //,
                //process: ["$q", "$timeout", function($q, $timeout) {
                //    //return selectProcessTemplate.open();
                //    var deferred = $q.defer();
                //    $timeout(function () {
                //        //deferred.resolve("successful");
                //        console.log('rejecting');
                //        deferred.reject("fail");   // resolve fails here
                //    }, 2000);
                //    return deferred.promise;
                //}]
            }
        })
        .state("projects.project.processes.edit", {
            url: "/edit/:process_id",
            templateUrl: "application/core/projects/project/processes/edit.html",
            controller: "projectEditProcess",
            controllerAs: 'edit'
        })
        .state("projects.project.processes.list", {
            url: "/list",
            templateUrl: "application/core/projects/project/processes/list.html",
            controller: "projectListProcess",
            controllerAs: "ctrl",
            resolve: {
                processes: ["project",
                    function (project) {
                        return project.processes;
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
                        if ($stateParams.process_id) {
                            var process_id = $stateParams.process_id;
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
        .state("projects.project.processes.list.view.setup", {
            url: "/setup",
            templateUrl: "application/core/projects/project/processes/setup.html"
        })
        .state("projects.project.processes.list.view.samples", {
            url: "/samples",
            templateUrl: "application/core/projects/project/processes/samples.html"
        })
        .state("projects.project.processes.list.view.files", {
            url: "/files",
            templateUrl: "application/core/projects/project/processes/files.html"
        })

        .state("projects.project.samples", {
            url: "/samples",
            templateUrl: "application/core/projects/project/samples/samples.html",
            controller: "SamplesController",
            controllerAs: "ctrl",
            resolve: {
                samples: ["project",
                    function (project) {
                        return project.samples;
                    }]
            }
        })
        .state("projects.project.samples.edit", {
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
        });

    $urlRouterProvider.otherwise('/home');
}]);

app.run(["$rootScope", "User", "Restangular", appRun]);

function appRun($rootScope, User, Restangular) {
    Restangular.setBaseUrl(mcglobals.apihost);
    if (User.isAuthenticated()) {
        Restangular.setDefaultRequestParams({apikey: User.apikey()});
    }

    // appRun will run when the application starts up and before any controllers have run.
    // This means it will run on a refresh. We check if the user is already authenticated
    // during the run. If they are then the browser has been refreshed and we need to
    // set the apikey param for Restangular. This param is set in the login-controller.
    // However on a refresh the login-controller isn't run so we need to explicitly set
    // the apikey param in Restangular.
    if (User.isAuthenticated()) {
        Restangular.setDefaultRequestParams({apikey: User.apikey()});
    }

    $rootScope.$on('$stateChangeStart', function () {
        if (User.isAuthenticated()) {
            $rootScope.email_address = User.u();
        }
    });
}
