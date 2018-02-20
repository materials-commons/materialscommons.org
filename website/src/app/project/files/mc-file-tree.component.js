/*@ngInject*/
function MCFileTreeComponentController($state, $stateParams, projectFileTreeAPI, mcprojstore, gridFiles) {
    const ctrl = this,
        proj = mcprojstore.currentProject;
    ctrl.projectID = proj.id;

    projectFileTreeAPI.getProjectRoot(proj.id).then((files) => {
        proj.files = files;
        ctrl.files = proj.files;
        ctrl.files[0].data.childrenLoaded = true;
        ctrl.files[0].expand = true;

        if ($stateParams.dir_id && !$stateParams.file_id) {
            const entry = gridFiles.findEntry(ctrl.files[0], $stateParams.dir_id);
            if (!entry) {
                // Only directories that are 1 level child of root will work.
                // If we didn't find an entry, that means its a request for a directory
                // deeper in the tree. So, for now ignore it and instead go to the root.
                $state.go('project.files.dir', {dir_id: ctrl.files[0].data.id});
                return;
            }
            const file = entry.model;
            projectFileTreeAPI.getDirectory(ctrl.projectID, $stateParams.dir_id).then(function (files) {
                file.children = files;
                file.active = true;
                file.data.childrenLoaded = true;
                file.expand = !file.expand;
                $state.go('project.files.dir', {dir_id: file.data.id});
            });
        } else if (!$stateParams.file_id) {
            $state.go('project.files.dir', {dir_id: ctrl.files[0].data.id});
        } else {
            $state.go('project.files.dir', {dir_id: ctrl.files[0].data.id});
        }
    });

    ctrl.gotoTopLevel = function (dir) {
        clearActiveStateInAllNodes();
        $state.go('project.files.dir', {dir_id: dir.data.id});
    };

    function clearActiveStateInAllNodes() {
        const proj = mcprojstore.currentProject;
        const treeModel = new TreeModel(),
            root = treeModel.parse(proj.files[0]);
        root.walk(function (treeNode) {
            treeNode.model.active = false;
        });
    }
}

angular.module('materialscommons').component('mcFileTree', {
    templateUrl: 'app/project/files/mc-file-tree.html',
    controller: MCFileTreeComponentController
});

/*@ngInject*/
function mcFileTreeDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            file: '='
        },
        controller: MCFileTreeDirDirectiveController,
        replace: true,
        controllerAs: '$ctrl',
        bindToController: true,
        templateUrl: 'app/project/files/mc-file-tree-dir.html',
        compile: function (element) {
            return RecursionHelper.compile(element, function () {
            });
        }
    }
}

angular.module('materialscommons').directive('mcFileTreeDir', mcFileTreeDirDirective);

/*@ngInject*/
function MCFileTreeDirDirectiveController(projectFileTreeAPI, mcprojstore, $state) {
    const ctrl = this;
    let proj = mcprojstore.currentProject;
    ctrl.projectID = proj.id;
    ctrl.files = ctrl.file.children;
    ctrl.setActive = setActive;

    //////////////////////////

    function setActive(file) {
        clearActiveStateInAllNodes();
        if (file.data.otype === 'file') {
            file.active = true;
            $state.go('project.files.file', {file_id: file.data.id});
        } else {
            if (!file.data.childrenLoaded) {
                projectFileTreeAPI.getDirectory(ctrl.projectID, file.data.id).then(function (files) {
                    file.children = files;
                    file.active = true;
                    file.data.childrenLoaded = true;
                    file.expand = !file.expand;
                    $state.go('project.files.dir', {dir_id: file.data.id});
                });
            } else {
                file.active = true;
                file.expand = !file.expand;
                $state.go('project.files.dir', {dir_id: file.data.id});
            }
        }
    }

    function clearActiveStateInAllNodes() {
        const proj = mcprojstore.currentProject;
        const treeModel = new TreeModel(),
            root = treeModel.parse(proj.files[0]);
        root.walk(function (treeNode) {
            treeNode.model.active = false;
        });
    }
}

angular.module('materialscommons').component('mcFileTreeDirControls', {
    templateUrl: 'app/project/files/mc-file-tree-dir-controls.html',
    controller: MCFileTreeDirControlsComponentController,
    bindings: {
        file: '=',
        projectId: '<',
        noDelete: '@',
        noRename: '@',
        node: '='
    }
});

/*@ngInject*/
function MCFileTreeDirControlsComponentController(projectFileTreeAPI, fileTreeDeleteService) {
    const ctrl = this;
    ctrl.addFolder = addFolder;
    ctrl.renameFolder = renameFolder;
    ctrl.deleteFolder = deleteFolder;
    ctrl.folderName = '';
    ctrl.promptForFolder = false;
    ctrl.promptForRename = false;
    ctrl.allowDelete = !ctrl.noDelete;
    ctrl.allowRename = !ctrl.noRename;

    /////////////////////////////

    function addFolder() {
        ctrl.promptForFolder = false;
        projectFileTreeAPI.createProjectDir(ctrl.projectId, ctrl.file.data.id, ctrl.folderName)
            .then((dir) => {
                // Fix up the datastructure either on server or on client so its a grid file.
                ctrl.file.children.push({
                    data: {
                        id: dir.id,
                        name: ctrl.folderName,
                        otype: 'directory'
                    }
                });
                ctrl.folderName = '';
            });
    }

    function renameFolder() {
        projectFileTreeAPI.renameProjectDir(ctrl.projectId, ctrl.file.data.id, ctrl.file.data.name)
            .then(() => ctrl.promptForRename = false);
    }

    function deleteFolder() {
        fileTreeDeleteService.deleteDir(ctrl.projectId, ctrl.file.data.id).then(
            (success) => {
                if (success) {
                    ctrl.node.remove()
                }
            }
        );
    }
}

angular.module('materialscommons').component('mcFileTreeFileControls', {
    templateUrl: 'app/project/files/mc-file-tree-file-controls.html',
    controller: MCFileTreeFileControlsComponentController,
    bindings: {
        file: '=',
        node: '=',
        projectId: '<'
    }
});

/*@ngInject*/
function MCFileTreeFileControlsComponentController(projectFileTreeAPI, fileTreeDeleteService, toast) {
    const ctrl = this;
    ctrl.promptForRename = false;
    ctrl.renameFile = renameFile;
    ctrl.deleteFile = deleteFile;
    ctrl.newFileName = ctrl.file.data.name;

    /////////////////////

    function renameFile() {
        projectFileTreeAPI.renameProjectFile(ctrl.projectId, ctrl.file.data.id, ctrl.newFileName)
            .then(
                () => {
                    ctrl.promptForRename = false;
                    ctrl.file.data.name = ctrl.newFileName;
                },
                () => {
                    toast.error('Rename failed');
                }
            );
    }

    function deleteFile() {
        fileTreeDeleteService.deleteFile(ctrl.projectId, ctrl.file.data.id).then(
            (success) => {
                if (success) {
                    ctrl.node.remove();
                }
            });
    }
}
