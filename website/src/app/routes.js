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
            template: '<div flex layout="column" ui-view></div>',
        })
        .state('projects.list', {
            url: '/list',
            template: '<mc-projects-list-view-container flex layout="column"></mc-projects-list-view-container>'
        })
        .state('globus', {
            url: '/globus',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('globus.auth', {
            url: '/auth',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('globus.auth.testing', {
            url: '/testing',
            template: '<mc-globus-auth-testing></mc-globus-auth-testing>'
        })
        .state('account', {
            url: '/account',
            abstract: true,
            template: '<div ui-view layout="column" class="height-100"></div>'
        })
        .state('account.settings', {
            url: '/settings',
            template: '<md-content><mc-account-settings></mc-account-settings></md-content>'
        })
        .state('account.settings.profile', {
            url: '/profile',
            template: '<mc-account-settings-profile></mc-account-settings-profile>'
        })
        .state('account.settings.projects', {
            url: '/projects',
            template: '<mc-account-settings-projects></mc-account-settings-projects>'
        })
        .state('templates', {
            url: '/templates',
            abstract: true,
            template: '<md-content ui-view layout="column" flex></md-content>'
        })
        .state('templates.builder', {
            url: '/builder',
            template: '<mc-template-builder layout="column" layout-fill class="height-100"></mc-template-builder>'
        })
        .state('admin', {
            url: '/admin',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('admin.info', {
            url: '/info',
            template: '<mc-admin-info></mc-admin-info>'
        })
        .state('admin.info.users', {
            url: '/users',
            template: '<mc-admin-info-users></mc-admin-info-users>'
        })
        .state('admin.info.projects', {
            url: '/users',
            template: '<mc-admin-info-projects></mc-admin-info-projects>'
        })
        .state('admin.info.globus', {
            url: '/globus',
            template: '<mc-admin-info-globus></mc-admin-info-globus>'
        })
        .state('public', {
            url: '/public',
            abstract: true,
            template: '<div ui-view layout="column"></div>'
        })
        .state('public.templates', {
            url: '/templates',
            template: '<mc-public-templates layout="column" layout-fill class="height-100"></mc-public-templates>'
        })
        .state('project', {
            url: '/project/:project_id',
            template: '<mc-project-view-container class="height-100" flex="100" layout="column"></mc-project-view-container>',
            resolve: {
                _project: ['projectsAPI', '$stateParams', 'mcStateStore', function(projectsAPI, $stateParams, mcStateStore) {
                    return projectsAPI.getProjectOverview($stateParams.project_id).then(p => {
                        mcStateStore.updateState('project', p);
                        return p;
                    });
                }]
            }
        })
        .state('project.home', {
            url: '/home',
            template: '<md-content layout="column" className="height-100"><mc-project-home project="$resolve._project" class="height-100"></mc-project-home></md-content>'
        })
        .state('project.details', {
            url: '/details',
            template: '<md-content layout="column" class="height-100"><mc-project-details class="height-100"></mc-project-details></md-content>'
        })
        .state('project.search', {
            url: '/search/:query',
            template: '<mc-project-search></mc-project-search>'
        })
        .state('project.notes', {
            url: '/notes',
            template: '<md-content layout="column" class="height-100"><mc-project-notes class="height-100"></mc-project-notes></md-content>'
        })
        .state('project.create', {
            url: '/create',
            abstract: true,
            template: '<ui-view flex layout="column"></ui-view>'
        })
        .state('project.experiment', {
            url: '/experiment/:experiment_id',
            template: `<mc-experiment class="height-100"></mc-experiment>`,
            resolve: {
                experiment: ['mcprojstore', '$stateParams', 'experimentsAPI', '_projstore',
                    (mcprojstore, $stateParams, experimentsAPI) => {
                        let e = mcprojstore.getExperiment($stateParams.experiment_id);
                        if (e.processes) {
                            return e;
                        } else {
                            return experimentsAPI.getExperimentForProject($stateParams.project_id, $stateParams.experiment_id).then(
                                e => {
                                    return mcprojstore.updateCurrentProject((project, transformers) => {
                                        project.experiments[e.id] = transformers.transformExperiment(e);
                                        return project;
                                    }).then(
                                        () => {
                                            return mcprojstore.getExperiment($stateParams.experiment_id);
                                        }
                                    );
                                }
                            );
                        }
                    }
                ]
            }
        })
        .state('project.experiment.details', {
            url: '/details',
            template: '<md-content layout="column" class="height-100"><mc-experiment-details experiment="$resolve.experiment" show-note="true"></mc-experiment-details></md-content>'
        })
        .state('project.experiment.forecast', {
            url: '/forecast',
            template: '<mc-experiment-forecast experiment="$resolve.experiment"></mc-experiment-forecast>'
        })
        .state('project.experiment.workflow', {
            url: '/workflow',
            template: '<mc-processes-workflow processes="$resolve.processes"></mc-processes-workflow>',
            resolve: {
                processes: ['experiment', (experiment) => _.values(experiment.processes)]
            }
        })
        .state('project.experiment.samples', {
            url: '/samples',
            template: '<md-content layout="column" class="height-100"><mc-project-samples samples="$resolve.samples"></mc-project-samples></md-content>',
            resolve: {
                samples: ['experimentsAPI', 'mcprojstore',
                    (experimentsAPI, mcprojstore) => {
                        const e = mcprojstore.currentExperiment;
                        const p = mcprojstore.currentProject;
                        return experimentsAPI.getSamplesForExperiment(p.id, e.id);
                    }
                ]
            }
        })
        .state('project.experiment.files', {
            url: '/files',
            template: '<md-content layout="column" class="height-100"><mc-experiment-files files="$resolve.files"></mc-experiment-files></md-content>',
            resolve: {
                files: ['experimentsAPI', '$stateParams',
                    (experimentsAPI, $stateParams) =>
                        experimentsAPI.getFilesForExperiment($stateParams.project_id, $stateParams.experiment_id)
                ]
            }
        })
        .state('project.experiment.tbuilder', {
            url: '/tbuilder',
            template: '<md-content layout="column" class="height-100"><mc-template-builder layout="column" layout-fill></mc-template-builder></md-content>'
        })
        .state('project.experiment.publish', {
            url: '/publish',
            template: '<mc-experiment-publish></mc-experiment-publish>'
        })
        .state('project.experiment.datasets', {
            url: '/datasets',
            template: '<md-content layout="column" class="height-100"><div flex layout="column" ui-view layout-fill></div></md-content>',
            abstract: true
        })
        .state('project.experiment.datasets.list', {
            url: '/list',
            template: '<mc-experiment-datasets layout="column" flex></mc-experiment-datasets>'
        })
        .state('project.experiment.datasets.dataset', {
            url: '/dataset/:dataset_id',
            template: '<mc-experiment-dataset layout="column" flex layout-fill></mc-experiment-dataset>'
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
            template: '<md-content layout="column" class="height-100"><mc-project-samples samples="$resolve.samples" class="height-100"></mc-project-samples></md-content>',
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
            // template: '<mc-file-tree flex layout-fill></mc-file-tree>'
            template: '<mc-project-files-view-container flex layout-fill></mc-project-files-view-container>'
        })
        .state('project.files.uploads2', {
            url: '/uploads2/:directory_id',
            template: '<mc-file-tree-uploader-container></mc-file-tree-uploader-container>'
        })
        .state('project.files.uploads', {
            url: '/uploads',
            template: '<mc-file-uploads reset-files="true"></mc-file-uploads>'
        })
        .state('project.files.file', {
            url: '/file/:file_id',
            template: '<mc-file-container></mc-file-container>'
        })
        .state('project.files.dir', {
            url: '/dir/:dir_id',
            template: '<mc-dir-container></mc-dir-container>'
        })
        .state('project.file', {
            url: '/file/:file_id',
            template: '<mc-file></mc-file>'
        })
        .state('project.sample', {
            url: '/sample/:sample_id',
            template: '<mc-sample></mc-sample>'
        })
        .state('project.datasets', {
            url: '/datasets',
            abstract: true,
            template: '<md-content><div ui-view layout="column" layout-fill></div></md-content>',
        })
        .state('project.datasets.list', {
            url: '/list',
            template: '<mc-project-datasets-view-container layout-fill flex></mc-project-datasets-view-container>'
        })
        .state('project.datasets.dataset', {
            url: '/dataset/:dataset_id',
            // template: '<md-content layout-fill flex layout="column" style="background-color:brown"><mc-project-dataset-view-container></mc-project-dataset-view-container></md-content>'
            template: '<mc-project-dataset-view-container></mc-project-dataset-view-container>'
        })
        .state('project.settings', {
            url: '/settings',
            template: '<mc-project-settings></mc-project-settings>'
        })
        .state('project.collaborators', {
            url: '/collaborators',
            template: '<mc-project-collaborators class="height-100"></mc-project-collaborators>'
        })
        .state('data', {
            url: '/data',
            abstract: true,
            // template: '<md-content ui-view flex></md-content>'
            template: '<div ui-view flex layout="column"></div>'
        })
        .state('data.dataset', {
            url: '/dataset/:dataset_id',
            template: '<mc-dataset-overview-container layout="column" flex></mc-dataset-overview-container>'
        })
        .state('data.home', {
            url: '/home',
            template: '<md-content flex><mc-data-home tags="$resolve.tags"></mc-data-home></md-content>',
            resolve: {
                tags: ['publicTagsAPI',
                    (publicTagsAPI) => publicTagsAPI.getPopularTags().then(
                        (tags) => tags.map(t => t.tag)
                    )
                ]
            }
        })
        .state('data.tag', {
            url: '/tag/:tag',
            template: '<mc-dataset-list datasets="$resolve.datasets" details-route="data.dataset" layout-margin></mc-dataset-list>',
            resolve: {
                datasets: ['publicDatasetsAPI', '$stateParams',
                    (publicDatasetsAPI, $stateParams) => publicDatasetsAPI.getDatasetsForTag($stateParams.tag)
                ]
            }
        })
        .state('data.home.recent', {
            url: '/recent',
            template: '<mc-dataset-list datasets="$resolve.datasets" details-route="data.dataset"></mc-dataset-list>',
            resolve: {
                datasets: ['publicDatasetsAPI',
                    (publicDatasetsAPI) => publicDatasetsAPI.getRecent()
                ]
            }
        })
        .state('data.home.top', {
            url: '/top',
            template: '<mc-dataset-list datasets="$resolve.datasets" details-route="data.dataset"></mc-dataset-list>',
            resolve: {
                datasets: ['publicDatasetsAPI',
                    (publicDatasetsAPI) => publicDatasetsAPI.getTopViewed()
                ]
            }
        });

    // $urlRouterProvider.otherwise('/login');
    $urlRouterProvider.otherwise('/data/home/top');
}
