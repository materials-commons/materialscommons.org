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
            resolve: {
                _projstore: ["mcprojstore", function (mcprojstore) {
                    return mcprojstore.ready();
                }],
                _projects: ["mcprojstore", "ProjectModel", "_projstore", function (mcprojstore, ProjectModel) {
                    let projects = mcprojstore.projects;
                    if (projects.length) {
                        return projects;
                    }

                    return ProjectModel.getProjectsForCurrentUser().then(
                        (projects) => {
                            mcprojstore.addProjects(...projects);
                            return mcprojstore.projects;
                        }
                    );
                }]
            }
        })
        .state('projects.list', {
            url: '/list',
            // template: '<mc-long-list flex layout="column"></mc-long-list>'
            template: '<mc-projects flex layout="column"></mc-projects>'
        })
        .state('account', {
            url: '/account',
            abstract: true,
            template: '<div ui-view></div>'
        })
        .state('account.settings', {
            url: '/settings',
            template: '<mc-account-settings></mc-account-settings>'
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
            template: '<div ui-view layout="column"></div>'
        })
        .state('templates.builder', {
            url: '/builder',
            template: '<mc-template-builder layout="column" layout-fill class="height-100"></mc-template-builder>'
        })
        .state('project', {
            url: '/project/:project_id',
            // abstract: true,
            // template: '<ui-view flex="100" layout="column"></ui-view>',
            template: '<mc-project class="height-100" flex="100" layout="column"></mc-project>',
            resolve: {
                _projstore: ["mcprojstore", function (mcprojstore) {
                    return mcprojstore.ready();
                }],
                /* inject _projstore to force next resolve to wait for store to ready ready*/
                _project: ["mcprojstore", "$stateParams", "experimentsAPI", "_projstore", function (mcprojstore, $stateParams, experimentsAPI) {
                    let p = mcprojstore.getProject($stateParams.project_id);
                    if (p.experimentsFullyLoaded) {
                        return p;
                    }

                    return experimentsAPI.getAllForProject($stateParams.project_id).then(
                        (experiments) => {
                            mcprojstore.updateCurrentProject((project, transformers) => {
                                let transformedExperiments = experiments.map(e => transformers.transformExperiment(e));
                                project.experiments = _.indexBy(transformedExperiments, 'id');
                                project.experimentsFullyLoaded = true;
                                return project;
                            });
                            return p;
                        }
                    );
                }]
            }
        })
        .state('project.home', {
            url: '/home',
            template: '<mc-project-home class="height-100"></mc-project-home>'
        })
        .state('project.details', {
            url: '/details',
            template: '<mc-project-details class="height-100"></mc-project-details>'
        })
        .state('project.search', {
            url: '/search/:query',
            template: '<mc-project-search></mc-project-search>'
        })
        .state('project.notes', {
            url: '/notes',
            template: '<mc-project-notes class="height-100"></mc-project-notes>'
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
                experiment: ["mcprojstore", "$stateParams", "_projstore",
                    (mcprojstore, $stateParams) => mcprojstore.getExperiment($stateParams.experiment_id)
                ]
            }
            //,
            // resolve: {
            //     experiment: ['experimentsAPI', 'toast', 'toUITask', '$stateParams', 'mcstate',
            //         function (experimentsAPI, toast, toUITask, $stateParams, mcstate) {
            //             return experimentsAPI.getForProject($stateParams.project_id, $stateParams.experiment_id)
            //                 .then(
            //                     (e) => {
            //                         e.tasks.forEach((task) => toUITask(task));
            //                         mcstate.set(mcstate.CURRENT$EXPERIMENT, e);
            //                         return e;
            //                     },
            //                     () => toast.error('Failed to retrieve experiment')
            //                 );
            //         }
            //     ]
            // }
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
            url: '/workflow',
            template: '<mc-processes-workflow processes="$resolve.processes"></mc-processes-workflow>',
            resolve: {
                processes: ["experiment", (experiment) => _.values(experiment.processes)]
            }
        })
        .state('project.experiment.samples', {
            url: '/samples',
            template: '<mc-project-samples samples="$resolve.samples"></mc-project-samples>',
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
            template: '<mc-experiment-files files="$resolve.files"></mc-experiment-files>',
            resolve: {
                files: ['experimentsAPI', '$stateParams',
                    (experimentsAPI, $stateParams) =>
                        experimentsAPI.getFilesForExperiment($stateParams.project_id, $stateParams.experiment_id)
                ]
            }
        })
        .state('project.experiment.tbuilder', {
            url: '/tbuilder',
            template: '<mc-template-builder layout="column" layout-fill></mc-template-builder>'
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
            template: '<div flex layout="column" ui-view layout-fill></div>',
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
            controller: ['$stateParams', function ($stateParams) {
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
            template: '<mc-project-samples samples="$resolve.samples" class="height-100"></mc-project-samples>',
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
            template: '<mc-file></mc-file>'
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
            template: '<div ui-view></div>'
        })
        .state('project.datasets.list', {
            url: '/list',
            template: '<mc-project-datasets></mc-project-datasets>'
        })
        .state('project.datasets.dataset', {
            url: '/dataset/:dataset_id',
            template: '<mc-dataset-overview dataset="$resolve.dataset"></mc-dataset-overview>',
            resolve: {
                dataset: ['$stateParams', 'datasetsAPI',
                    ($stateParams, datasetsAPI) => datasetsAPI.getDataset('e634ee47-b217-4547-a345-5007cd146dbd', '511930bd-96a5-4678-9626-ef79aceb75b5', '57490e70-df32-4592-8a6f-8a6cfbd36174')
                ]
            }
        })
        .state('project.datasets.dataset2', {
            url: '/dataset',
            template: '<mc-workflow-as-table></mc-workflow-as-table>'
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
            template: '<md-content ui-view flex></md-content>'
        })
        .state('data.dataset', {
            url: '/dataset/:dataset_id',
            template: '<mc-dataset-overview-container></mc-dataset-overview-container>'
        })
        .state('data.home', {
            url: '/home',
            template: '<mc-data-home tags="$resolve.tags"></mc-data-home>',
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
