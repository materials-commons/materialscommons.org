
/*@ngInject*/
function MCDirOverviewComponentController(mcfile, $filter, toast, isImage) {
    const ctrl = this;

    ctrl.filterByType = false;
    ctrl.viewFiles = viewFiles;
    ctrl.fileSrc = mcfile.src;
    ctrl.isImage = isImage;
    ctrl.allFiles = {
        files: allFiles()
    };
    ctrl.selectedCount = 0;
    ctrl.downloadSelectedFiles = downloadSelectedFiles;
    ctrl.fileSelect = fileSelect;
    ctrl.selectAllFiles = selectAllFiles;
    ctrl.deselectSelectedFiles = deselectSelectedFiles;
    ctrl.files = ctrl.allFiles.files;
    ctrl.fileFilter = {
        name: ''
    };
    ctrl.downloadState = 'none';
    ctrl.downloadURL = '';
    ctrl.downloadMessageFlash = '';

    ////////////////

    function allFiles() {
        return ctrl.dir.children
            .filter(f => f.data.otype === 'file' && f.data.id).map(f => {
                f.data.selected = false;
                return f.data;
            });
    }

    function viewFiles(selected) {
        ctrl.files = selected.files.map(function(f) {
            f.selected = false;
            return f;
        });
        ctrl.selectedCount = 0;
    }

    function fileSelect(file) {
        if (file.selected) {
            ctrl.selectedCount--;
        } else {
            ctrl.selectedCount++;
        }
        let selectedFiles = ctrl.files.filter(f => f.selected);
        ctrl.onSelected({selected: selectedFiles});
    }

    function selectAllFiles() {
        const filesToSelect = $filter('filter')(ctrl.files, ctrl.fileFilter);
        filesToSelect.forEach(function(f) {
            f.selected = true;
        });
        ctrl.selectedCount = ctrl.files.length;
        ctrl.onSelected({selected: ctrl.files});
    }

    function deselectSelectedFiles() {
        ctrl.files.forEach(function(f) {
            if (f.selected) {
                f.selected = false;
            }
        });
        ctrl.selectedCount = 0;
        ctrl.onSelected({selected: []});
    }

    function downloadSelectedFiles() {
        ctrl.downloadState = 'preparing';
        const selectedFiles = ctrl.files.filter(f => f.selected);
        ctrl.onDownloadFiles({files: selectedFiles}).then(
            downloadURL => {
                ctrl.downloadURL = downloadURL;
                ctrl.downloadState = 'done';
                deselectSelectedFiles();
            },
            () => toast.error('Unable to create file archive.')
        );
    }
}

angular.module('materialscommons').component('mcDirOverview', {
    templateUrl: 'app/project/files/components/dir/mc-dir-overview.html',
    controller: MCDirOverviewComponentController,
    bindings: {
        dir: '=',
        project: '=',
        onSelected: '&',
        onDownloadFiles: '&'
    }
});

