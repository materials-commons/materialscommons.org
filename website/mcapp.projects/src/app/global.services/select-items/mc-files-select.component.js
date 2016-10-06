angular.module('materialscommons').component('mcFilesSelect', {
    templateUrl: 'app/global.services/select-items/mc-files-select.html',
    controller: MCFilesSelectComponentController,
    bindings: {
        project: '='
    }
});

function MCFilesSelectComponentController(fileTreeProjectService) {
    'ngInject';

    var ctrl = this;

    fileTreeProjectService.getProjectRoot(ctrl.project.id).then(function(files) {
        ctrl.project.files = files;
        ctrl.files = ctrl.project.files;
        ctrl.files[0].data.childrenLoaded = true;
        ctrl.files[0].expand = true;
    });

}

angular.module('materialscommons').directive('mcFilesSelectDir', MCFilesSelectDirDirective);
function MCFilesSelectDirDirective(RecursionHelper) {
    'ngInject';

    return {
        restrict: 'E',
        scope: {
            file: '=',
            project: '='
        },
        controller: MCFilesSelectDirDirectiveController,
        replace: true,
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'app/global.services/select-items/mc-files-select-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function() {});
        }
    }
}

function MCFilesSelectDirDirectiveController(fileTreeProjectService) {
    'ngInject';

    var ctrl = this;
    ctrl.files = ctrl.file.children;
    ctrl.setActive = setActive;
    ctrl.dirToggle = dirToggle;

    ////////////////////

    function setActive(file) {
        clearActiveStateInAllNodes();

        if (file.data._type === 'file') {
            file.active = true;
        } else {
            if (!file.data.childrenLoaded) {
                fileTreeProjectService.getDirectory(ctrl.project.id, file.data.id).then(function(files) {
                    file.children = files;
                    file.active = true;
                    file.data.childrenLoaded = true;
                    file.expand = !file.expand;
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

    function dirToggle(dir) {
        if (!dir.data.childrenLoaded) {
            fileTreeProjectService.getDirectory(ctrl.project.id, dir.data.id).then(function(files) {
                dir.children = files;
                dir.active = true;
                dir.data.childrenLoaded = true;
                dir.children.forEach(function(f) {
                    if (f.data._type === 'file') {
                        f.data.selected = dir.data.selected;
                    }
                });
            });
        } else {
            dir.children.forEach(function(f) {
                if (f.data._type === 'file') {
                    f.data.selected = dir.data.selected;
                }
            });
        }
    }
}
