class MCDirFilterByTypeComponentController {
    /*ngInject*/
    constructor(fileType) {
        this.onlyFiles = {
            files: this.dir.children.filter(f => f.data.otype === 'file' && f.data.id)
        };
        this.allFiles = {
            files: this.onlyFiles.files.map(f => f.data)
        };
        this.overview = _.values(fileType.overview(this.onlyFiles.files));
    }

    viewSelected(selected) {
        this.onViewSelected({selected: selected});
    }

    filterByTypeChanged() {
        // Reset view to all files when filterByType is deselected
        if (!this.filterByType) {
            this.onViewSelected({selected: this.allFiles});
        }
    }
}

angular.module('materialscommons').component('mcDirFilterByType', {
    template: require('./mc-dir-filter-by-type.html'),
    controller: MCDirFilterByTypeComponentController,
    bindings: {
        dir: '=',
        onViewSelected: '&'
    }
});
