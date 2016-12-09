export function selectItemsService($mdDialog) {
    'ngInject';

    return {
        open: function() {
            let tabs = {
                processes: false,
                files: false,
                samples: false,
                reviews: false,
                uploadFiles: false
            };

            let opts = {
                experimentId: '',
                singleSelection: false
            };

            if (arguments.length === 0) {
                throw "Invalid arguments to service selectItems:open()";
            }

            for (let i = 0; i < arguments.length; i++) {
                if ((arguments[i] in tabs)) {
                    tabs[arguments[i]] = true;
                } else if (_.isObject(arguments[i])) {
                    opts.experimentId = arguments[i].experimentId;
                    opts.singleSelection = arguments[i].singleSelection;
                }
            }

            let showFilesTree = tabs.files && opts.experimentId === '';
            let showFilesTable = tabs.files && opts.experimentId !== '';
            return $mdDialog.show({
                templateUrl: 'app/global.services/select-items/select-items.html',
                controller: SelectItemsServiceModalController,
                controllerAs: 'ctrl',
                bindToController: true,
                locals: {
                    showProcesses: tabs.processes,

                    showFilesTree: showFilesTree,

                    showFilesTable: showFilesTable,

                    showSamples: tabs.samples,


                    showReviews: tabs.reviews,

                    showUploadFiles: tabs.uploadFiles,

                    options: opts
                }
            });
        }
    };
}

/*@ngInject*/
function SelectItemsServiceModalController($mdDialog, projectsService, $stateParams, project, experimentsService) {
    let ctrl = this;

    ctrl.project = project.get();
    ctrl.tabs = loadTabs();
    ctrl.activeTab = ctrl.tabs[0].name;
    ctrl.setActive = setActive;
    ctrl.isActive = isActive;
    ctrl.ok = ok;
    ctrl.cancel = cancel;
    ctrl.processes = [];
    ctrl.samples = [];

    /////////////////////////

    function setActive(tab) {
        ctrl.activeTab = tab;
    }

    function isActive(tab) {
        return ctrl.activeTab === tab;
    }

    function ok() {
        const selectedProcesses = ctrl.processes.filter(function(p) {
            return p.input || p.output;
        });

        let selectedSamples = ctrl.samples.filter(function(s) {
            for (let i = 0; i < s.versions.length; i++) {
                if (s.versions[i].selected) {
                    return true;
                }
            }
            return false;
        });

        let selectedFiles = getSelectedFiles();

        $mdDialog.hide({
            processes: selectedProcesses,
            samples: selectedSamples,
            files: selectedFiles
        });
    }

    function getSelectedFiles() {
        let files = [];
        if (ctrl.showFilesTree) {
            let treeModel = new TreeModel(),
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
        } else if (ctrl.showFilesTable) {
            return ctrl.files.filter(f => f.selected);
        } else {
            return [];
        }
    }

    function cancel() {
        $mdDialog.cancel();
    }

    function loadTabs() {
        let tabs = [];
        if (ctrl.showProcesses) {
            tabs.push(newTab('processes', 'fa-code-fork'));
            if (ctrl.options.experimentId) {
                // get processes for experiment
            } else {
                projectsService.getProjectProcesses($stateParams.project_id).then(function(processes) {
                    ctrl.processes = processes;
                });
            }
        }

        if (ctrl.showSamples) {
            tabs.push(newTab('samples', 'fa-cubes'));
            if (ctrl.options.experimentId && ctrl.options.experimentId !== '') {
                experimentsService.getSamplesForExperiment($stateParams.project_id, ctrl.options.experimentId).then(
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

        if (ctrl.showFilesTree) {
            tabs.push(newTab('file tree', 'fa-files-o'));
        }

        if (ctrl.showFilesTable) {
            tabs.push(newTab('file table', 'fa-files-o'));
            experimentsService.getFilesForExperiment($stateParams.project_id, ctrl.options.experimentId)
                .then(
                    (files) => {
                        ctrl.files = files;
                    }
                );
        }

        if (ctrl.showReviews) {
            tabs.push(newTab('reviews', 'fa-comment'));
        }

        if (ctrl.showUploadFiles) {
            tabs.push(newTab('Upload Files', 'fa-upload'));
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

