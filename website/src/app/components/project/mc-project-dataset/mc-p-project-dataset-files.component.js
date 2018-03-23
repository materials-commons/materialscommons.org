class MCPProjectDatasetFilesComponentController {
    /*@ngInject*/
    constructor() {
        this.files = [
            {
                selected: false,
                name: 'hardeningdata.xls',
                path: 'project1/hardening tests',
                samples: 'E1XKG'
            },
            {
                selected: false,
                name: 'crack.tiff',
                path: 'project1/hardening tests',
                samples: 'S1XKG'
            },
            {
                selected: false,
                name: 'sem.odg',
                path: 'project1/sem runs/hardening',
                samples: 'S1XKG_400'
            },
            {
                selected: false,
                name: 'sem graphs.xls',
                path: 'project1/sem runs/hardening',
                samples: 'S1XKG_400'
            },
            {
                selected: false,
                name: 'final_results.xls',
                path: 'project1/hardening tests/results',
                samples: 'S1XKG, S1XKG_400'
            },
        ]
    }
}

angular.module('materialscommons').component('mcPProjectDatasetFiles', {
    template: require('./mc-p-project-dataset-files.html'),
    controller: MCPProjectDatasetFilesComponentController
});