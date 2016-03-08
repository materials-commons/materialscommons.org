function setupRoutes($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            template: '<mc-login></mc-login>'
        })
        .state('projects', {
            url: '/projects',
            abstract: true,
            template: '<div ui-view></div>',
        })
        .state('projects.list', {
            url: '/list',
            template: '<mc-projects></mc-projects>'
        })
        .state('projects.share', {
            url: '/share',
            template: '<mc-projects-share></mc-projects-share>'
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
                    function($stateParams, projectsService, project) {
                        return projectsService.getProject($stateParams.project_id)
                            .then(function(proj) {
                                project.set(proj);
                                return proj;
                            });
                    }],

                _templates: ["processTemplates", "templates", "_project",
                    function(processTemplates, templates, project) {
                        var projectTemplates = processTemplates.templates(project.process_templates, project.id);
                        templates.set(projectTemplates);
                        return projectTemplates;
                    }]
            }
        })
        .state('project.home', {
            url: '/home',
            template: '<mc-project-home></mc-project-home>',
            // hack to update project view
            resolve: {
                // Set the current project in the project service so all components
                // will resolve without having to worry if a promise has resolved.
                // The resolved object is ignored.
                _project: ["$stateParams", "projectsService", "project",
                    // Inject projects so that it resolves before looking up the project.
                    function($stateParams, projectsService, project) {
                        return projectsService.getProject($stateParams.project_id)
                            .then(function(proj) {
                                project.set(proj);
                                return proj;
                            });
                    }]
            }
        })
        .state('project.search', {
            url: '/search/:query',
            template: '<mc-project-search></mc-project-search>'
        })
        .state('project.processes', {
            url: '/processes',
            template: '<mc-project-processes></mc-project-processes>'
        })
        .state('project.processes.create', {
            url: '/create-process/:template_id',
            template: '<mc-process-create></mc-process-create>',
            resolve: {
                _template: ['templates', 'template', '$stateParams', 'projectsService',
                    function(templates, template, $stateParams, projectsService) {
                        if ($stateParams.process_id) {
                            return projectsService.getProjectProcess($stateParams.project_id, $stateParams.process_id)
                                .then(function(process) {
                                    var t = templates.loadTemplateFromProcess($stateParams.template_id, process);
                                    template.set(t);
                                    return t;
                                });
                        } else {
                            var t = templates.getTemplate($stateParams.template_id);
                            template.set(t);
                            return t;
                        }
                    }]
            }
        })
        .state('project.processes.process', {
            url: '/process/:process_id',
            template: '<mc-process></mc-process>',
            resolve: {
                _process: ['process', 'projectsService', '$stateParams',
                    function(process, projectsService, $stateParams) {
                        return projectsService.getProjectProcess($stateParams.project_id, $stateParams.process_id)
                            .then(function(p) {
                                process.set(p);
                                return p;
                            });
                    }]
            }
        })
        .state('project.processes.edit', {
            url: '/edit/:process_id',
            template: '<mc-process-edit></mc-process-edit>',
            resolve: {
                _process: ['process', 'projectsService', '$stateParams', 'processEdit', 'templates',
                    function(process, projectsService, $stateParams, processEdit, templates) {
                        return projectsService.getProjectProcess($stateParams.project_id, $stateParams.process_id)
                            .then(function(proc) {
                                var t = templates.getTemplate(proc.process_name);
                                var p = processEdit.fillProcess(t, proc);
                                process.set(p);
                                return p;
                            });
                    }]
            }
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
            template: '<mc-file-tree2></mc-file-tree2>'
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
