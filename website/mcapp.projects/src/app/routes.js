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
        .state('reset', {
            url: '/reset',
            template: '<mc-reset-password></mc-reset-password>'
        })
        .state('rvalidate', {
            url: '/rvalidate/:validation_uuid',
            template: '<mc-reset-validate></mc-reset-validate>'
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
            resolve: {
                _project: ["$stateParams", "projectsAPI", "mcstate",
                    // Inject projects so that it resolves before looking up the project.
                    function($stateParams, projectsAPI, mcstate) {
                        return projectsAPI.getProject($stateParams.project_id)
                            .then(function(proj) {
                                mcstate.set(mcstate.CURRENT$PROJECT, proj);
                                return proj;
                            });
                    }],
                _templates: ["templates", function(templates) {
                    return templates.getServerTemplates().then(
                        (t) => {
                            templates.set(t);
                            return t;
                        }
                    );
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
        .state('project.create', {
            url: '/create',
            abstract: true,
            template: '<ui-view flex layout="column"></ui-view>'
        })
        .state('project.experiment', {
            url: '/experiment/:experiment_id',
            template: `<mc-experiment></mc-experiment>`,
            resolve: {
                experiment: ['experimentsAPI', 'toast', 'toUITask', '$stateParams', 'mcstate',
                    function(experimentsAPI, toast, toUITask, $stateParams, mcstate) {
                        return experimentsAPI.getForProject($stateParams.project_id, $stateParams.experiment_id)
                            .then(
                                (e) => {
                                    e.tasks.forEach((task) => toUITask(task));
                                    mcstate.set(mcstate.CURRENT$EXPERIMENT, e);
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
            template: '<mc-experiment-details experiment="$resolve.experiment" show-note="true"></mc-experiment-details>'
        })
        .state('project.experiment.tasks', {
            url: '/tasks',
            template: '<mc-experiment-tasks></mc-experiment-tasks>'
        })
        .state('project.experiment.forecast', {
            url: '/forecast',
            template: '<mc-experiment-forecast experiment="$resolve.experiment"></mc-experiment-forecast>'
        })
        .state('project.experiment.workflow', {
            url: '/processes',
            template: '<mc-processes-workflow processes="$resolve.processes"></mc-processes-workflow>',
            resolve: {
                processes: ['experimentsAPI', '$stateParams',
                    (experimentsAPI, $stateParams) =>
                        experimentsAPI.getProcessesForExperiment($stateParams.project_id, $stateParams.experiment_id)
                ]
            }
        })
        .state('project.experiment.samples', {
            url: '/samples',
            template: '<mc-project-samples samples="$resolve.samples"></mc-project-samples>',
            resolve: {
                samples: ['experimentsAPI', '$stateParams',
                    (experimentsAPI, $stateParams) =>
                        experimentsAPI.getSamplesForExperiment($stateParams.project_id, $stateParams.experiment_id)
                ]
            }
        })
        .state('project.experiment.files', {
            url: '/files',
            template: '<mc-experiment-files files="$resolve.files"></mc-experiment-files>',
            resolve: {
                files: ['experimentsAPI', '$stateParams',
                    (experimentsAPI, $stateParams) =>
                        experimentsAPI.getFilesForExperiment($stateParams.project_id, $stateParams.experiment_id)
                ]
            }
        })
        .state('project.experiment.notes', {
            url: '/notes',
            template: '<mc-experiment-notes experiment="$resolve.experiment"></mc-experiment-notes>'
        })
        .state('project.experiment.publish', {
            url: '/publish',
            template: '<mc-experiment-publish></mc-experiment-publish>'
        })
        .state('project.experiment.datasets', {
            url: '/datasets',
            template: '<div ui-view></div>',
            abstract: true
        })
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
        .state('project.experiments', {
            url: '/experiments',
            template: '<mc-project-experiments experiments="$resolve.experiments"></mc-project-experiments>',
            resolve: {
                experiments: ['experimentsAPI', '$stateParams',
                    (experimentsAPI, $stateParams) =>
                        experimentsAPI.getAllForProject($stateParams.project_id)
                ]
            }
        })
        .state('project.processes', {
            url: '/processes',
            template: '<mc-project-processes processes="$resolve.processes"></mc-project-processes>',
            resolve: {
                processes: ['projectsAPI', '$stateParams',
                    (projectsAPI, $stateParams) =>
                        projectsAPI.getProjectProcesses($stateParams.project_id)
                ]
            }
        })
        .state('project.samples', {
            url: '/samples',
            template: '<mc-project-samples samples="$resolve.samples"></mc-project-samples>',
            resolve: {
                samples: ['samplesAPI', '$stateParams',
                    (samplesAPI, $stateParams) =>
                        samplesAPI.getProjectSamples($stateParams.project_id)
                ]
            }
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
            template: '<mc-file-uploads reset-files="true"></mc-file-uploads>'
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
