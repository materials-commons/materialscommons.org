(function(module) {
    module.component('mcFileTree2', {
        templateUrl: 'project/files/mc-file-tree2.html',
        controller: 'MCFileTree2ComponentController'
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

    module.controller('MCFileTree2ComponentController', MCFileTree2ComponentController);
    MCFileTree2ComponentController.$inject = [
        '$scope', 'project', '$state', '$stateParams', 'pubsub', 'fileTreeProjectService',
        'fileTreeMoveService', 'toastr'
    ];
    function MCFileTree2ComponentController($scope, project, $state, $stateParams, pubsub,
                                            fileTreeProjectService, fileTreeMoveService, toastr) {
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

    module.directive('mcFileTree2Dir', mcFileTree2DirDirective);
    mcFileTree2DirDirective.$inject = ['RecursionHelper'];
    function mcFileTree2DirDirective(RecursionHelper) {
        return {
            restrict: 'E',
            scope: {
                file: '='
            },
            controller: 'MCFileTree2DirDirectiveController',
            replace: true,
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'project/files/mc-file-tree2-dir.html',
            compile: function(element) {
                return RecursionHelper.compile(element, function(scope, ielement, iattrs, controller, transcludeFn) {
                });
            }
        }
    }

    module.controller('MCFileTree2DirDirectiveController', MCFileTree2DirDirectiveController);
    MCFileTree2DirDirectiveController.$inject = ['fileTreeProjectService', 'project', '$state'];
    function MCFileTree2DirDirectiveController(fileTreeProjectService, project, $state) {
        var ctrl = this;
        var projectID = project.get().id;
        ctrl.setActive = setActive;
        ctrl.placeholderName = placeholderName;

        if (ctrl.file.data._type === 'directory' && !ctrl.file.data.childrenLoaded) {
            fileTreeProjectService.getDirectory(projectID, ctrl.file.data.id).then(function(files) {
                ctrl.file.children = files;
                if (!ctrl.file.children.length) {
                    loadEmptyPlaceHolder(ctrl.file);
                }
                ctrl.file.data.childrenLoaded = true;
                ctrl.files = ctrl.file.children;
            });
        } else {
            ctrl.files = ctrl.file.children;
        }

        function setActive(node, file) {
            // clear all other active flags.
            var treeModel = new TreeModel(),
                root = treeModel.parse(project.get().files[0]);
            root.walk(function(node) {
                node.model.active = false;
            });
            file.active = true;

            if (file.data._type === 'file') {
                $state.go('project.files.file', {file_id: file.data.id});
            } else {
                node.toggle();
                $state.go('project.files.dir', {dir_id: file.data.id});
            }
        }
    }
}(angular.module('materialscommons')));