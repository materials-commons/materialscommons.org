class SelectItemsService {
    /*@ngInject*/
    constructor($mdDialog, projectsAPI, experimentsAPI, projectFileTreeAPI, mcStateStore) {
        this.$mdDialog = $mdDialog;
        this.projectsAPI = projectsAPI;
        this.experimentsAPI = experimentsAPI;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.mcStateStore = mcStateStore;
    }

    dialog(locals, controller) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/select-items-dialog.html',
            controller: controller,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            multiple: true,
            locals: locals
        });
    }

    fileTree(uploadFiles = false) {
        let project = this.mcStateStore.getState('project');
        return this.projectFileTreeAPI.getProjectRoot(project.id).then(
            files => {
                project.files = files;
                return this.dialog({
                    showFileTree: true,
                    showFileTree2: false,
                    showFileTable: false,
                    uploadFiles,
                    project
                }, SelectItemsFilesServiceModalController);
            });
    }

    fileTree2(selection, uploadFiles = false) {
        let project = this.mcStateStore.getState('project');
        return this.projectFileTreeAPI.getProjectRoot(project.id).then(
            files => {
                project.files = files;
                return this.dialog({
                    showFileTree: false,
                    showFileTree2: true,
                    showFileTable: false,
                    uploadFiles,
                    project,
                    selection
                }, SelectItemsFilesService2ModalController);
            });
    }

    fileTreeForProject(projectId, uploadFiles = false) {
        return this.projectFileTreeAPI.getProjectRoot(projectId).then(
            files => {
                let project = {};
                project.files = files;
                return this.dialog({
                    showFileTree: true,
                    showFileTable: false,
                    uploadFiles,
                    project
                }, SelectItemsFilesServiceModalController);
            });
    }

    fileTable(files = [], uploadFiles = false) {
        return this.dialog({
            showFileTable: true,
            showFileTree: false,
            uploadFiles,
            files
        }, SelectItemsFilesServiceModalController);
    }

    samples(samples = [], singleSelection = false) {
        return this.dialog({samples, singleSelection}, SelectItemsSamplesServiceModalController);
    }

    samplesFromProject(projectId, showAllSamples = false, singleSelection = false) {
        let options = {
            singleSelection,
            showAllSamples
        };
        return this.projectsAPI.getProjectSamples(projectId).then(
            (samples) => this.dialog({samples, options}, SelectItemsSamplesServiceModalController)
        );
    }

    samplesFromExperiment(projectId, experimentId, singleSelection = false) {
        return this.experimentsAPI.getSamplesForExperiment(projectId, experimentId).then(
            (samples) => this.dialog({samples, singleSelection}, SelectItemsSamplesServiceModalController)
        );
    }

    processes(processes = []) {
        return this.dialog({processes}, SelectItemsProcessesServiceModalController);
    }

    processesFromProject(projectId) {
        return this.projectsAPI.getProjectProcesses(projectId).then(
            (processes) => this.dialog({processes}, SelectItemsProcessesServiceModalController)
        );
    }
}

class SelectItemsBase {
    constructor($mdDialog) {
        this.activeTab = 0;
        this.currentTab = '';
        this.tabs = [];
        this.$mdDialog = $mdDialog;
    }

    isActive(tab) {
        return this.activeTab === tab;
    }

    setActive(tabName) {
        this.activeTab = tabName;
    }

    addTab(name, icon) {
        this.tabs.push({name, icon});
        if (this.tabs.length === 1) {
            this.activeTab = this.tabs[0].name;
        }
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class SelectItemsState {
    constructor() {
        this.uploadedFiles = [];
    }

    reset() {
        this.uploadedFiles = [];
    }
}

const selectItemsState = new SelectItemsState();

class SelectItemsSamplesServiceModalController extends SelectItemsBase {
    /*@ngInject*/
    constructor($mdDialog) {
        super($mdDialog);
        this.$onInit();
    }

    $onInit() {
        this.addTab('samples', 'fa-cubes');
    }

    ok() {
        let selectedSamples = this.samples.filter(s => {
            for (let i = 0; i < s.versions.length; i++) {
                if (s.versions[i].selected) {
                    return true;
                }
            }
            return false;
        });
        this.$mdDialog.hide({samples: selectedSamples});
    }
}

class SelectItemsProcessesServiceModalController extends SelectItemsBase {
    /*@ngInject*/
    constructor($mdDialog) {
        super($mdDialog);
        this.$onInit();
    }

    $onInit() {
        this.addTab('processes', 'fa-code-fork');
    }

    ok() {
        let selectedProcesses = this.processes.filter(p => p.input || p.output);
        this.$mdDialog.hide({processes: selectedProcesses});
    }
}

class SelectItemsFilesServiceModalController extends SelectItemsBase {
    /*@ngInject*/
    constructor($mdDialog) {
        super($mdDialog);
        this.$onInit();
    }

    $onInit() {
        selectItemsState.reset();
        if (this.showFileTable) {
            this.addTab('file table', 'fa-files-o');
        }

        if (this.showFileTree) {
            this.addTab('file tree', 'fa-files-o');
        }

        if (this.uploadFiles) {
            this.addTab('Upload Files', 'fa-upload');
        }
    }

    uploadComplete(files) {
        selectItemsState.uploadedFiles = files;
    }

    ok() {
        let selectedFiles = [];
        let selectedDirs = [];
        if (this.showFileTree) {
            let {files, dirs} = this.getFilesFromTree();
            selectedFiles = selectedFiles.concat(files);
            selectedDirs = selectedDirs.concat(dirs);
        }

        if (this.showFileTable) {
            selectedFiles = selectedFiles.concat(this.files.filter(f => f.selected));
        }

        if (this.uploadFiles) {
            selectedFiles = selectedFiles.concat(selectItemsState.uploadedFiles);
        }

        this.$mdDialog.hide({files: selectedFiles, dirs: selectedDirs});
    }

    getFilesFromTree() {
        let selectedFilesFromTree = [];
        let selectedDirsFromTree = [];
        let unselectedFilesFromTree = [];
        let unselectedDirsFromTree = [];
        let projectFiles = this.project.files;
        if (projectFiles && projectFiles.length) {
            let treeModel = new TreeModel(),
                root = treeModel.parse(this.project.files[0]);
            // Walk the tree looking for selected files and adding them to the
            // list of files. Also reset the selected flag so the next time
            // the popup for files is used it doesn't show previously selected
            // items.
            root.walk({strategy: 'pre'}, function(node) {
                if (node.model.data.selected) {
                    node.model.data.selected = false;
                    if (node.model.data.otype === 'file') {
                        selectedFilesFromTree.push(node.model.data);
                    } else if (node.model.data.otype === 'directory') {
                        selectedDirsFromTree.push(node.model.data);
                    }
                } else {
                    if (node.model.data.otype === 'file') {
                        unselectedFilesFromTree.push(node.model.data);
                    } else if (node.model.data.otype === 'directory') {
                        unselectedDirsFromTree.push(node.model.data);
                    }
                }
            });
        }

        return {
            files: selectedFilesFromTree,
            dirs: selectedDirsFromTree,
            unselected_files: unselectedFilesFromTree,
            unselected_dirs: unselectedDirsFromTree
        };
    }
}

class SelectItemsFilesService2ModalController extends SelectItemsBase {
    /*@ngInject*/
    constructor($mdDialog, fileSelection) {
        super($mdDialog);
        this.fileSelection = fileSelection;
        this.$onInit();
        console.log('selection = ', this.selection);
    }

    $onInit() {
        selectItemsState.reset();
        if (this.showFileTable) {
            this.addTab('file table', 'fa-files-o');
        }

        if (this.showFileTree) {
            this.addTab('file tree', 'fa-files-o');
        }

        if (this.showFileTree2) {
            this.addTab('file tree2', 'fa-files-o');
        }

        if (this.uploadFiles) {
            this.addTab('Upload Files', 'fa-upload');
        }
    }

    uploadComplete(files) {
        selectItemsState.uploadedFiles = files;
    }

    ok() {
        console.log('fileSelection.toSelection()', this.fileSelection.toSelection());
        let selectedFiles = [];
        let selectedDirs = [];
        if (this.showFileTree) {
            let {files, dirs} = this.getFilesFromTree();
            selectedFiles = selectedFiles.concat(files);
            selectedDirs = selectedDirs.concat(dirs);
        }

        if (this.showFileTable) {
            selectedFiles = selectedFiles.concat(this.files.filter(f => f.selected));
        }

        if (this.uploadFiles) {
            selectedFiles = selectedFiles.concat(selectItemsState.uploadedFiles);
        }

        this.$mdDialog.hide({files: selectedFiles, dirs: selectedDirs});
    }

    getFilesFromTree() {
        let selectedFilesFromTree = [];
        let selectedDirsFromTree = [];
        let unselectedFilesFromTree = [];
        let unselectedDirsFromTree = [];
        let projectFiles = this.project.files;
        if (projectFiles && projectFiles.length) {
            let treeModel = new TreeModel(),
                root = treeModel.parse(this.project.files[0]);
            // Walk the tree looking for selected files and adding them to the
            // list of files. Also reset the selected flag so the next time
            // the popup for files is used it doesn't show previously selected
            // items.
            root.walk({strategy: 'pre'}, function(node) {
                if (node.model.data.selected) {
                    node.model.data.selected = false;
                    if (node.model.data.otype === 'file') {
                        selectedFilesFromTree.push(node.model.data);
                    } else if (node.model.data.otype === 'directory') {
                        selectedDirsFromTree.push(node.model.data);
                    }
                } else {
                    if (node.model.data.otype === 'file') {
                        unselectedFilesFromTree.push(node.model.data);
                    } else if (node.model.data.otype === 'directory') {
                        unselectedDirsFromTree.push(node.model.data);
                    }
                }
            });
        }

        return {
            files: selectedFilesFromTree,
            dirs: selectedDirsFromTree,
            unselected_files: unselectedFilesFromTree,
            unselected_dirs: unselectedDirsFromTree
        };
    }
}

angular.module('materialscommons').service('selectItems', SelectItemsService);
