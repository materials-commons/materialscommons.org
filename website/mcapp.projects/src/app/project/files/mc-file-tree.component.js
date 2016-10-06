angular.module('materialscommons').component('mcFileTree', {
    templateUrl: 'app/project/files/mc-file-tree.html',
    controller: MCFileTreeComponentController
});

var placeholderName = '__$$placeholder$$__';
var dropFolder = null;

function loadEmptyPlaceHolder(dir) {
    dir.children.push({
        data: {
            name: placeholderName,
            _type: 'file',
            mediatype: {
                mime: '',
                description: ''
            }

        }
    });
}

/*@ngInject*/
function MCFileTreeComponentController(project, $state, $stateParams, fileTreeProjectService,
                                       fileTreeMoveService, toastr, mcFlow) {
    var ctrl = this,
        proj = project.get();
    ctrl.projectID = proj.id;
    ctrl.flow = mcFlow.get();

    ctrl.treeOptions = {
        dropped: function(event) {
            var src = event.source.nodeScope.$modelValue,
                dest = dropFolder ? dropFolder : event.dest.nodesScope.$nodeScope.$modelValue,
                srcDir = event.source.nodeScope.$parentNodeScope.$modelValue;

            if (src.data._type === 'directory') {
                return fileTreeMoveService.moveDir(src.data.id, dest.data.id).then(() => {
                    if (!srcDir.children.length) {
                        loadEmptyPlaceHolder(srcDir);
                    }
                    return true;
                });
            } else {
                return fileTreeMoveService.moveFile(src.data.id, srcDir.data.id, dest.data.id).then(() => {
                    if (!srcDir.children.length) {
                        loadEmptyPlaceHolder(srcDir);
                    }
                    return true;
                });
            }

        },

        beforeDrop: function(event) {
            var src = event.source.nodeScope.$modelValue,
                dest = dropFolder ? dropFolder : event.dest.nodesScope.$nodeScope.$modelValue,
                srcDir = event.source.nodeScope.$parentNodeScope.$modelValue;
            if (srcDir.data.id == dest.data.id) {
                // Reject move - attempt to move the file/directory around under it's
                // current directory;
                var itemType = src.data._type === 'directory' ? 'Directory' : 'File';
                toastr.error('Attempt to move ' + itemType + " into current it's directory.",
                    'Error', {closeButton: true});
                return false;
            }

            return true;
        }
    };

    fileTreeProjectService.getProjectRoot(proj.id).then((files) => {
        proj.files = files;
        ctrl.files = proj.files;
        ctrl.files[0].data.childrenLoaded = true;
        ctrl.files[0].expand = true;

        if (!$stateParams.file_id) {
            $state.go('project.files.dir', {dir_id: ctrl.files[0].data.id});
        }
    });
}

angular.module('materialscommons').directive('mcFileTreeDir', mcFileTreeDirDirective);

/*@ngInject*/
function mcFileTreeDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            file: '='
        },
        controller: MCFileTreeDirDirectiveController,
        replace: true,
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'app/project/files/mc-file-tree-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function() {});
        }
    }
}

/*@ngInject*/
function MCFileTreeDirDirectiveController(fileTreeProjectService, project, $state) {
    var ctrl = this;
    ctrl.projectID = project.get().id;
    ctrl.files = ctrl.file.children;
    ctrl.placeholderName = placeholderName;

    ctrl.setActive = setActive;

    ctrl.onMouseEnter = (event, node) => {
        if (event.buttons) {
            dropFolder = node.$nodeScope.$modelValue;
        }
    };

    ctrl.onMouseLeave = () => {
        dropFolder = null;
    };

    //////////////////////////

    function setActive(node, file) {
        clearActiveStateInAllNodes();
        if (file.data._type === 'file') {
            file.active = true;
            $state.go('project.files.file', {file_id: file.data.id});
        } else {
            node.toggle();
            if (!file.data.childrenLoaded) {
                fileTreeProjectService.getDirectory(ctrl.projectID, file.data.id).then(function(files) {
                    file.children = files;
                    if (!file.children.length) {
                        loadEmptyPlaceHolder(file);
                    }
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
        var treeModel = new TreeModel(),
            root = treeModel.parse(project.get().files[0]);
        root.walk(function(treeNode) {
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
function MCFileTreeDirControlsComponentController(fileTreeProjectService, fileTreeDeleteService) {
    var ctrl = this;
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
        fileTreeProjectService.createProjectDir(ctrl.projectId, ctrl.file.data.id, ctrl.folderName)
            .then((dir) => {
                // Fix up the datastructure either on server or on client so its a grid file.
                ctrl.file.children.push({
                    data: {
                        id: dir.id,
                        name: ctrl.folderName,
                        _type: 'directory'
                    }
                });
                ctrl.folderName = '';
            });
    }

    function renameFolder() {
        fileTreeProjectService.renameProjectDir(ctrl.projectId, ctrl.file.data.id, ctrl.file.data.name)
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
function MCFileTreeFileControlsComponentController(fileTreeProjectService, fileTreeDeleteService, toast) {
    var ctrl = this;
    ctrl.promptForRename = false;
    ctrl.renameFile = renameFile;
    ctrl.deleteFile = deleteFile;
    ctrl.newFileName = ctrl.file.data.name;

    /////////////////////

    function renameFile() {
        fileTreeProjectService.renameProjectFile(ctrl.projectId, ctrl.file.data.id, ctrl.newFileName)
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
