class MCDirOverviewComponentController {
    /*@ngInject*/
    constructor(mcfile, isImage, $filter) {
        this.fileSrc = mcfile.src;
        this.isImage = isImage;
        this.$filter = $filter;
    }

    $onInit() {
        this.allFiles = {
            files: this._allFiles()
        };

        this.fileFilter = {
            name: ''
        };

        this.selectedCount = 0;
        this.files = this.allFiles.files;
    }

    _allFiles() {
        return this.dir.children.filter(f => f.data.otype === 'file' && f.data.id).map(f => {
            f.data.selected = false;
            return f.data;
        });
    }

    viewFiles(selected) {
        this.files = selected.files.map(function (f) {
            f.selected = false;
            return f;
        });
        this.selectedCount = 0;
    }

    fileSelect(file) {
        if (file.selected) {
            this.selectedCount--;
        } else {
            this.selectedCount++;
        }
        let selectedFiles = this.files.filter(f => f.selected);
        this.onSelected({selected: selectedFiles});
    }

    selectAllFiles() {
        const filesToSelect = this.$filter('filter')(this.files, this.fileFilter);
        filesToSelect.forEach(function (f) {
            f.selected = true;
        });
        this.selectedCount = this.files.length;
        this.onSelected({selected: this.files});
    }

    deselectSelectedFiles() {
        this.files.forEach(f => {
            if (f.selected) {
                f.selected = false;
            }
        });
        this.selectedCount = 0;
        this.onSelected({selected: []});
    }
}

angular.module('materialscommons').component('mcDirOverview', {
    templateUrl: 'app/project/files/components/dir/mc-dir-overview.html',
    controller: MCDirOverviewComponentController,
    bindings: {
        dir: '<',
        onSelected: '&'
    }
});