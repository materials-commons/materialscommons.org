/*ngInject*/
export function setupRoutes($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('login', {
            url: '/login',
            template: '<mc-login></mc-login>'
        })
        .state('join', {
            url: '/join',
            template: '<mc-join></mc-join>'
        })
        .state('releasenotes', {
            url: '/releasenotes',
            template: '<mc-release-notes></mc-release-notes>'
        })
        .state('validate', {
            url: '/validate/:validation_uuid',
            template: '<mc-join-validate></mc-join-validate>'
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
        .state('user.settings', {
            url: '/settings',
            template: '<mc-user-settings></mc-user-settings>'
        })
        .state('user.settings.account', {
            url: '/account',
            template: '<mc-user-settings-account></mc-user-settings-account>'
        })
        .state('user.settings.projects', {
            url: '/projects',
            template: '<mc-user-settings-projects></mc-user-settings-projects>'
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
            //template:'<mc-project></mc-project>',
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
            resolve: {
                // hack to update project view
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
        .state('project.experiment.processes', {
            url: '/processes',
            template: '<mc-processes-graph processes="ctrl.processes"></mc-processes-graph>',
            controllerAs: 'ctrl',
            controller: ['processes', function(processes) {
                var ctrl = this;
                ctrl.processes = processes;
            }],
            resolve: {
                processes: ['experimentsService', '$stateParams', 'toast',
                    function(experimentsService, $stateParams, toast) {
                        var ctrl = this;
                        ctrl.processes = [];
                        return experimentsService.getProcessesForExperiment($stateParams.project_id, $stateParams.experiment_id).then(
                            (processes) => processes,
                            () => toast.error('Error retrieving processes for experiment')
                        );
                    }]
            }
        })
        .state('project.experiment.samples', {
            url: '/samples',
            template: '<mc-project-samples samples="ctrl.samples"></mc-project-samples>',
            controllerAs: 'ctrl',
            controller: ['experimentsService', '$stateParams', 'toast',
                function(experimentsService, $stateParams, toast) {
                    var ctrl = this;
                    ctrl.samples = [];
                    experimentsService.getSamplesForExperiment($stateParams.project_id, $stateParams.experiment_id).then(
                        (samples) => ctrl.samples = samples,
                        () => toast.error('Error retrieving samples for experiment')
                    );
                }]
        })
        .state('project.experiment.files', {
            url: '/files',
            template: '<mc-experiment-files files="ctrl.files"></mc-experiment-files>',
            controllerAs: 'ctrl',
            controller: ['experimentsService', '$stateParams', 'toast',
                function(experimentsService, $stateParams, toast) {
                    var ctrl = this;
                    ctrl.files = [];
                    experimentsService.getFilesForExperiment($stateParams.project_id, $stateParams.experiment_id)
                        .then(
                            (files) => ctrl.files = files,
                            () => toast.error('Error retrieving files for experiment')
                        );
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
        .state('project.experiment.publish', {
            url: '/publish',
            template: '<mc-experiment-publish></mc-experiment-publish>'
        });

    /* eslint-disable angular/controller-as-route */
    $stateProvider
        .state('project.experiment.datasets', {
            url: '/datasets',
            template: '<div ui-view></div>',
            controller: ['$stateParams', '$state', function($stateParams, $state) {
                if (!$stateParams.dataset_id) {
                    $state.go('project.experiment.datasets.list');
                }
            }]
        });
    /* eslint-enable angular/controller-as-route */

    $stateProvider
        .state('project.experiment.datasets.list', {
            url: '/list',
            template: '<mc-experiment-datasets></mc-experiment-datasets>'
        })
        .state('project.experiment.datasets.dataset', {
            url: '/dataset/:dataset_id',
            template: '<mc-experiment-dataset></mc-experiment-dataset>'
        })
        .state('project.experiment.sample', {
            url: '/sample/:sample_id',
            template: '<mc-show-sample sample-id="ctrl.sampleId"></mc-show-sample>',
            controllerAs: 'ctrl',
            controller: ['$stateParams', function($stateParams) {
                this.sampleId = $stateParams.sample_id;
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
            controller: ['projectsService', '$stateParams', 'toast',
                function(projectsService, $stateParams, toast) {
                    var ctrl = this;
                    ctrl.processes = [];
                    projectsService.getProjectProcesses($stateParams.project_id).then(
                        (processes) => ctrl.processes = processes,
                        () => toast.error('Unable to retrieve project processes')
                    )
                }]
        })
        .state('project.process', {
            url: '/process/:process_id',
            template: '<mc-process></mc-process>',
            resolve: {
                _process: ['process', 'projectsService', '$stateParams',
                    function(process, projectsService, $stateParams) {
                        return projectsService.getProjectProcess($stateParams.project_id, $stateParams.process_id)
                            .then(
                                (p) => {
                                    process.set(p);
                                    return p;
                                }
                            );
                    }]
            }
        })
        .state('project.process.edit', {
            url: '/edit',
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
            controller: ['samplesService', '$stateParams', 'toast',
                function(samplesService, $stateParams, toast) {
                    var ctrl = this;
                    ctrl.samples = [];
                    samplesService.getProjectSamples($stateParams.project_id).then(
                        (samples) => ctrl.samples = samples,
                        () => toast.error('Error retrieving samples for project')
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
        .state('project.file', {
            url: '/file/:file_id',
            template: '<mc-file></mc-file>'
        })
        .state('project.files.dir', {
            url: '/dir/:dir_id',
            template: '<mc-dir></mc-dir>'
        })
        .state('project.sample', {
            url: '/sample/:sample_id',
            template: '<mc-sample></mc-sample>'
        })
        .state('project.settings', {
            url: '/settings',
            template: '<mc-project-settings></mc-project-settings>'
        });

    $urlRouterProvider.otherwise('/login');
}
