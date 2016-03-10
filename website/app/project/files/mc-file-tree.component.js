(function(module) {
    module.component('mcFileTree', {
        templateUrl: 'project/files/mc-file-tree.html',
        controller: 'MCFileTreeComponentController'
    });

    var placeholderName = '__$$placeholder$$__';

    function loadEmptyPlaceHolder(dir) {
        dir.children.push({
            data: {
                name: placeholderName,
                _type: 'file'
            }
        });
    }

    module.controller('MCFileTreeComponentController', MCFileTreeComponentController);
    MCFileTreeComponentController.$inject = [
        'project', '$state', '$stateParams', 'fileTreeProjectService', 'fileTreeMoveService', 'toastr'
    ];
    function MCFileTreeComponentController(project, $state, $stateParams, fileTreeProjectService,
                                            fileTreeMoveService, toastr) {
        var ctrl = this;
        var proj = project.get();

        ctrl.treeOptions = {
            dropped: function(event) {
                var src = event.source.nodeScope.$modelValue,
                    dest = event.dest.nodesScope.$nodeScope.$modelValue,
                    srcDir = event.source.nodeScope.$parentNodeScope.$modelValue;

                if (src.data._type === 'directory') {
                    return fileTreeMoveService.moveDir(src.data.id, dest.data.id).then(function() {
                        if (srcDir.children.length === 0) {
                            loadEmptyPlaceHolder(srcDir);
                        }
                        return true;
                    });
                } else {
                    return fileTreeMoveService.moveFile(src.data.id, srcDir.data.id, dest.data.id).then(function() {
                        if (srcDir.children.length === 0) {
                            loadEmptyPlaceHolder(srcDir);
                        }
                        return true;
                    });
                }

            },

            beforeDrop: function(event) {
                var src = event.source.nodeScope.$modelValue,
                    dest = event.dest.nodesScope.$nodeScope.$modelValue,
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

        fileTreeProjectService.getProjectRoot(proj.id).then(function(files) {
            proj.files = files;
            ctrl.files = proj.files;
            ctrl.files[0].data.childrenLoaded = true;
            ctrl.files[0].expand = true;

            if (!$stateParams.file_id) {
                $state.go('project.files.dir', {dir_id: ctrl.files[0].data.id});
            }
        });
    }

    module.directive('mcFileTreeDir', mcFileTreeDirDirective);
    mcFileTreeDirDirective.$inject = ['RecursionHelper'];
    function mcFileTreeDirDirective(RecursionHelper) {
        return {
            restrict: 'E',
            scope: {
                file: '='
            },
            controller: 'MCFileTreeDirDirectiveController',
            replace: true,
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'project/files/mc-file-tree-dir.html',
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, ielement, iattrs, controller, transcludeFn) {
                });
            }
        }
    }

    module.controller('MCFileTreeDirDirectiveController', MCFileTreeDirDirectiveController);
    MCFileTreeDirDirectiveController.$inject = ['fileTreeProjectService', 'project', '$state'];
    function MCFileTreeDirDirectiveController(fileTreeProjectService, project, $state) {
        var ctrl = this;
        var projectID = project.get().id;
        ctrl.placeholderName = placeholderName;
        ctrl.files = ctrl.file.children;
        ctrl.folderName = '';

        ctrl.setActive = setActive;
        ctrl.addFolder = addFolder;
        ctrl.renameFolder = renameFolder;

        //////////////////////////

        function setActive(node, file) {
            clearActiveStateInAllNodes();

            if (file.data._type === 'file') {
                file.active = true;
                $state.go('project.files.file', {file_id: file.data.id});
            } else {
                node.toggle();
                if (!file.data.childrenLoaded) {
                    fileTreeProjectService.getDirectory(projectID, file.data.id).then(function(files) {
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

        function addFolder(file) {
            file.promptForFolder = false;
            fileTreeProjectService.createProjectDir(project.get().id, file.data.id, ctrl.folderName)
                .then(function(dir) {
                    // Fix up the datastructure either on server or on client so its a grid file.
                    file.children.push({
                        data: {
                            id: dir.id,
                            name: ctrl.folderName,
                            _type: 'directory'
                        }
                    });
                    ctrl.folderName = '';
                });
        }

        function renameFolder(file) {
            fileTreeProjectService.renameProjectDir(project.get().id, file.data.id, file.data.name)
                .then(function() {
                    file.promptForRename = false;
                });
        }
    }
}(angular.module('materialscommons')));