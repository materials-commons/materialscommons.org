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
}

angular.module('materialscommons').component('mcDirFilterByType', {
    templateUrl: 'app/project/files/components/dir/mc-dir-filter-by-type.html',
    controller: MCDirFilterByTypeComponentController,
    bindings: {
        dir: '=',
        onViewSelected: '&'
    }
});
