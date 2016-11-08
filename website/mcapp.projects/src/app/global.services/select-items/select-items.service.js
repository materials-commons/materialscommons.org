export function selectItemsService($modal) {
    'ngInject';

    return {
        open: function() {
            var tabs = {
                processes: false,
                files: false,
                samples: false,
                reviews: false
            };

            let opts = {
                experimentId: '',
                singleSelection: false
            };

            if (arguments.length === 0) {
                throw "Invalid arguments to service selectItems:open()";
            }

            for (var i = 0; i < arguments.length; i++) {
                if ((arguments[i] in tabs)) {
                    tabs[arguments[i]] = true;
                } else if (_.isObject(arguments[i])) {
                    opts.experimentId = arguments[i].experimentId;
                    opts.singleSelection = arguments[i].singleSelection;
                }
            }

            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/global.services/select-items/select-items.html',
                controller: SelectItemsServiceModalController,
                controllerAs: 'ctrl',
                resolve: {
                    showProcesses: function() {
                        return tabs.processes;
                    },

                    showFilesTree: function() {
                        return tabs.files && opts.experimentId === '';
                    },

                    showFilesTable: function() {
                        return tabs.files && opts.experimentId !== '';
                    },

                    showSamples: function() {
                        return tabs.samples;
                    },

                    showReviews: function() {
                        return tabs.reviews;
                    },

                    options: () => opts
                }
            });
            return modal.result;
        }
    };
}

/*@ngInject*/
function SelectItemsServiceModalController($modalInstance, showProcesses, showFilesTree, showFilesTable, showSamples, options,
                                           showReviews, projectsService, $stateParams, project, experimentsService) {
    var ctrl = this;

    ctrl.project = project.get();
    ctrl.tabs = loadTabs();
    ctrl.activeTab = ctrl.tabs[0].name;
    ctrl.setActive = setActive;
    ctrl.isActive = isActive;
    ctrl.ok = ok;
    ctrl.cancel = cancel;
    ctrl.processes = [];
    ctrl.samples = [];
    ctrl.options = options;

    /////////////////////////

    function setActive(tab) {
        ctrl.activeTab = tab;
    }

    function isActive(tab) {
        return ctrl.activeTab === tab;
    }

    function ok() {
        var selectedProcesses = ctrl.processes.filter(function(p) {
            return p.input || p.output;
        });

        var selectedSamples = ctrl.samples.filter(function(s) {
            for (let i = 0; i < s.versions.length; i++) {
                if (s.versions[i].selected) {
                    return true;
                }
            }
            return false;
        });

        var selectedFiles = getSelectedFiles();

        $modalInstance.close({
            processes: selectedProcesses,
            samples: selectedSamples,
            files: selectedFiles
        });
    }

    function getSelectedFiles() {
        var files = [];
        if (showFilesTree) {
            var treeModel = new TreeModel(),
                root = treeModel.parse(project.get().files[0]);
            // Walk the tree looking for selected files and adding them to the
            // list of files. Also reset the selected flag so the next time
            // the popup for files is used it doesn't show previously selected
            // items.
            root.walk({strategy: 'pre'}, function(node) {
                if (node.model.data.selected) {
                    node.model.data.selected = false;
                    if (node.model.data.otype === 'file') {
                        files.push(node.model.data);
                    }
                }
            });
            return files;
        } else if (showFilesTable) {
            return ctrl.files.filter(f => f.selected);
        } else {
            return [];
        }
    }

    function cancel() {
        $modalInstance.dismiss('cancel');
    }

    function loadTabs() {
        var tabs = [];
        if (showProcesses) {
            tabs.push(newTab('processes', 'fa-code-fork'));
            if (options.experimentId) {
                // get processes for experiment
            } else {
                projectsService.getProjectProcesses($stateParams.project_id).then(function(processes) {
                    ctrl.processes = processes;
                });
            }
        }

        if (showSamples) {
            tabs.push(newTab('samples', 'fa-cubes'));
            if (options.experimentId && options.experimentId !== '') {
                experimentsService.getSamplesForExperiment($stateParams.project_id, options.experimentId).then(
                    (samples) => {
                        ctrl.samples = samples;
                    }
                )
            } else {
                projectsService.getProjectSamples($stateParams.project_id).then(function(samples) {
                    ctrl.samples = samples;
                });
            }
        }

        if (showFilesTree) {
            tabs.push(newTab('file tree', 'fa-files-o'));
        }

        if (showFilesTable) {
            tabs.push(newTab('file table', 'fa-files-o'));
            experimentsService.getFilesForExperiment($stateParams.project_id, options.experimentId)
                .then(
                    (files) => {
                        ctrl.files = files;
                    }
                );
        }

        if (showReviews) {
            tabs.push(newTab('reviews', 'fa-comment'));
        }

        tabs.sort(function compareByName(t1, t2) {
            if (t1.name < t2.name) {
                return -1;
            }
            if (t1.name > t2.name) {
                return 1;
            }
            return 0;
        });

        return tabs;
    }

    function newTab(name, icon) {
        return {
            name: name,
            icon: icon
        };
    }
}

