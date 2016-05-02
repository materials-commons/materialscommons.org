/*ngInject*/
export function setupRoutes($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            template: '<mc-login></mc-login>'
        })
        .state('projects', {
            url: '/projects',
            abstract: true,
            template: '<div ui-view></div>'
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
            abstract: true,
            template: '<ui-view flex="100" layout="column"></ui-view>',
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
        .state('project.create', {
            url: '/create',
            abstract: true,
            template: '<ui-view flex layout="column"></ui-view>'
        })
        .state('project.experiment', {
            url: '/experiment/:experiment_id',
            template: `<mc-experiment></mc-experiment>`,
            controllerAs: 'ctrl',
            controller: ['experiment', 'currentExperiment', function(experiment, currentExperiment) {
                currentExperiment.set(experiment);
            }],
            resolve: {
                experiment: ['experimentsService', 'toast', 'toUITask', '$stateParams', 'currentExperiment',
                    function(experimentsService, toast, toUITask, $stateParams, currentExperiment) {
                        return experimentsService.getForProject($stateParams.project_id, $stateParams.experiment_id)
                            .then(
                                (e) => {
                                    e.tasks.forEach((task) => toUITask(task));
                                    currentExperiment.set(e);
                                    return e;
                                },
                                () => toast.error('Failed to retrieve experiment')
                            );
                    }
                ]
            }
        })
        .state('project.experiment.details', {
            url: '/details',
            template: '<mc-experiment-details experiment="ctrl.experiment"></mc-experiment-details>',
            controllerAs: 'ctrl',
            controller: ['experiment', function(experiment) {
                this.experiment = experiment;
            }]
        })
        .state('project.experiment.tasks', {
            url: '/tasks',
            template: '<mc-experiment-tasks></mc-experiment-tasks>'
        })
        .state('project.experiment.forecast', {
            url: '/forecast',
            template: '<mc-experiment-forecast experiment="ctrl.experiment"></mc-experiment-forecast>',
            controllerAs: 'ctrl',
            controller: ['experiment', function(experiment) {
                this.experiment = experiment;
            }]
        })
        .state('project.experiment.flagged', {
            url: '/flagged',
            template: '<mc-experiment-flagged experiment="ctrl.experiment"></mc-experiment-flagged>',
            controllerAs: 'ctrl',
            controller: ['experiment', function(experiment) {
                this.experiment = experiment;
            }]
        })
        .state('project.experiment.samples', {
            url: '/samples',
            template: '<mc-experiment-samples experiment="ctrl.experiment"></mc-experiment-samples>',
            controllerAs: 'ctrl',
            controller: ['experiment', function(experiment) {
                this.experiment = experiment;
            }]
        })
        .state('project.experiment.files', {
            url: '/files',
            template: '<mc-experiment-files experiment="ctrl.experiment"></mc-experiment-files>',
            controllerAs: 'ctrl',
            controller: ['experiment', function(experiment) {
                this.experiment = experiment;
            }]
        })
        .state('project.experiment.notes', {
            url: '/notes',
            template: '<mc-experiment-notes experiment="ctrl.experiment"></mc-experiment-notes>',
            controllerAs: 'ctrl',
            controller: ['experiment', function(experiment) {
                this.experiment = experiment;
            }]
        })
        .state('project.create.process', {
            url: '/process/:template_id/:process_id',
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
        .state('project.experiments', {
            url: '/experiments',
            template: '<mc-project-experiments experiments="ctrl.experiments"></mc-project-experiments>',
            controllerAs: 'ctrl',
            controller: ['$stateParams', 'experimentsService', 'toast', function($stateParams, experimentsService, toast) {
                let ctrl = this;
                ctrl.experiments = [];
                experimentsService.getAllForProject($stateParams.project_id).then(
                    (experiments) => {
                        ctrl.experiments = experiments;
                    },
                    () => toast.error('Unable to retrieve experiments for project')
                );
            }]
        })
        .state('project.processes', {
            url: '/processes',
            template: '<mc-project-processes processes="ctrl.processes"></mc-project-processes>',
            controllerAs: 'ctrl',
            controller: ['projectsService', '$stateParams', 'toastr',
                function(projectsService, $stateParams, toastr) {
                    var ctrl = this;
                    ctrl.processes = [];
                    projectsService.getProjectProcesses($stateParams.project_id).then(
                        (processes) => {
                            ctrl.processes = processes;
                        },
                        () => toastr.error('Unable to retrieve project processes', 'Error', {closeButton: true})
                    )
                }]
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
            template: '<mc-project-samples samples="ctrl.samples"></mc-project-samples>',
            controllerAs: 'ctrl',
            controller: ['samplesService', '$stateParams', 'toastr',
                function(samplesService, $stateParams, toastr) {
                    var ctrl = this;
                    ctrl.samples = [];
                    samplesService.getProjectSamples($stateParams.project_id).then(
                        (samples) => {
                            //console.dir(samples);
                            ctrl.samples = samples;
                        },
                        () => toastr.error('Error retrieving samples for project', 'Error', {closeButton: true})
                    );
                }]
        })
        .state('project.samples.sample', {
            url: '/sample/:sample_id',
            template: '<mc-sample></mc-sample>'
        })
        .state('project.files', {
            url: '/files',
            template: '<mc-file-tree flex layout-fill></mc-file-tree>'
        })
        .state('project.files.uploads', {
            url: '/uploads',
            template: '<mc-file-uploads></mc-file-uploads>'
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
