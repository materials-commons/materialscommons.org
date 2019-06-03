angular.module('materialscommons').component('mcFilesSelect2', {
    template: require('./mc-files-select2.html'),
    controller: MCFilesSelect2ComponentController,
    bindings: {
        project: '=',
        selection: '=',
    }
});

function MCFilesSelect2ComponentController(fileSelection) {
    'ngInject';

    var ctrl = this;

    ctrl.files = ctrl.project.files;
    ctrl.files[0].data.childrenLoaded = true;
    ctrl.files[0].expand = true;
    fileSelection.loadSelection(ctrl.selection);

    ctrl.files[0].children.forEach(f => {
        if (f.data.otype === 'directory') {
            f.data.selected = fileSelection.isIncludedDir(f.data.path, ctrl.files[0].data);
        } else {
            f.data.selected = fileSelection.isIncludedFile(f.data.path, ctrl.files[0].data);
        }
    });
}

angular.module('materialscommons').directive('mcFilesSelectDir2', MCFilesSelectDir2Directive);

function MCFilesSelectDir2Directive(RecursionHelper) {
    'ngInject';

    return {
        restrict: 'E',
        scope: {
            file: '=',
            project: '=',
        },
        controller: MCFilesSelectDir2DirectiveController,
        replace: true,
        controllerAs: 'ctrl',
        bindToController: true,
        template: require('./mc-files-select-dir2.html'),
        compile: function(element) {
            return RecursionHelper.compile(element, function() {
            });
        }
    };
}

function MCFilesSelectDir2DirectiveController(projectFileTreeAPI, fileSelection) {
    'ngInject';

    var ctrl = this;
    ctrl.files = ctrl.file.children;
    ctrl.setActive = setActive;
    ctrl.dirToggle = dirToggle;
    ctrl.setFile = setFile;

    ////////////////////

    function setActive(file) {
        clearActiveStateInAllNodes();

        if (file.data && file.data.otype === 'file') {
            file.active = true;
        } else {
            if (!file.data.childrenLoaded) {
                projectFileTreeAPI.getDirectory(ctrl.project.id, file.data.id).then(function(files) {
                    file.children = files;
                    file.active = true;
                    file.data.childrenLoaded = true;
                    file.expand = !file.expand;
                    file.children.forEach(f => {
                        if (f.data.otype === 'directory') {
                            f.data.selected = fileSelection.isIncludedDir(f.data.path, file.data);
                        } else {
                            f.data.selected = fileSelection.isIncludedFile(f.data.path, file.data);
                        }
                    });
                });
            } else {
                file.active = true;
                file.expand = !file.expand;
            }
        }
    }

    function clearActiveStateInAllNodes() {
        var treeModel = new TreeModel(),
            root = treeModel.parse(ctrl.project.files[0]);
        root.walk(function(treeNode) {
            treeNode.model.active = false;
        });
    }

    function setFile(file) {
        if (file.data.selected) {
            fileSelection.includeFile(file.data.path);
        } else {
            if (ctrl.file.data.selected) {
                fileSelection.excludeFile(file.data.path);
            }
        }
    }

    function dirToggle(dir) {
        if (dir.data.selected) {
            fileSelection.includeDir(dir.data.path);
        } else {
            if (ctrl.file.data.selected) {
                fileSelection.excludeDir(dir.data.path);
            } else {
                fileSelection.removeDir(dir.data.path);
            }
        }
        if (!dir.data.childrenLoaded) {
            projectFileTreeAPI.getDirectory(ctrl.project.id, dir.data.id).then(function(files) {
                dir.children = files;
                dir.active = true;
                dir.data.childrenLoaded = true;
                dir.children.forEach(function(f) {
                    if (f.data.otype === 'directory') {
                        f.data.selected = fileSelection.isIncludedDir(f.data.path, dir.data);
                    } else {
                        f.data.selected = fileSelection.isIncludedFile(f.data.path, dir.data);
                    }
                });
            });
        } else {
            dir.children.forEach(function(f) {
                if (f.data.otype === 'file') {
                    f.data.selected = dir.data.selected;
                } else {
                    dirToggleNoLoad(f, dir.data.selected);
                }
            });
        }
    }

    function dirToggleNoLoad(dir, selected) {
        dir.data.selected = selected;
        if (dir.data.childrenLoaded) {
            dir.children.forEach(f => {
                if (f.data.otype === 'directory') {
                    dirToggleNoLoad(f, selected);
                } else {
                    f.data.selected = selected;
                }
            });
        }
    }
}
