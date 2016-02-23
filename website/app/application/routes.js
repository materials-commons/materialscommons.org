function setupRoutes($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            template: '<mc-login></mc-login>'
        })
        .state('projects', {
            url: '/projects',
            template: '<mc-projects></mc-projects>'
        })
        .state('user', {
            url: '/user',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('user.apikey', {
            url: '/apikey',
            template: '<mc-user-apikey></mc-user-apikey>'
        })
        .state('user.password', {
            url: '/password',
            template: '<mc-user-password></mc-user-password>'
        })
        .state('project', {
            url: '/project/:project_id',
            template: '<mc-project></mc-project>',
            resolve: {
                // Set the current project in the project service so all components
                // will resolve without having to worry if a promise has resolved.
                // The resolved object is ignored.
                _project: ["$stateParams", "projectsService", "project",
                    // Inject projects so that it resolves before looking up the project.
                    function ($stateParams, projectsService, project) {
                        return projectsService.getProject($stateParams.project_id)
                            .then(function (proj) {
                                project.set(proj);
                                return proj;
                            });
                    }]
            }
        })
        .state('project.home', {
            url: '/home',
            template: '<mc-project-home></mc-project-home>'
        })
        .state('project.search', {
            url: '/search/:query',
            template: '<mc-project-search></mc-project-search>'
        })
        .state('project.processes', {
            url: '/processes',
            template: '<mc-project-processes></mc-project-processes>'
        })
        .state('project.processes.process', {
            url: '/process/:process_id',
            template: '<mc-process></mc-process>'
        })
        .state('project.samples', {
            url: '/samples',
            template: '<mc-project-samples></mc-project-samples>'
        })
        .state('project.samples.sample', {
            url: '/sample/:sample_id',
            template: '<mc-sample></mc-sample>'
        })
        .state('project.files', {
            url: '/files',
            template: '<mc-file-tree></mc-file-tree>'
        })
        .state('project.files.file', {
            url: '/file/:file_id',
            template: '<mc-file></mc-file>'
        })
        .state('project.files.dir', {
            url: '/dir/:dir_id',
            template: '<mc-dir></mc-dir>'
        })
        .state('project.settings', {
            url: '/settings',
            template: '<mc-project-settings></mc-project-settings>'
        });

    $urlRouterProvider.otherwise('/login');
}
