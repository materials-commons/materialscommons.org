angular.module('materialscommons').factory('projectTreeService', projectTreeService);

function projectTreeService(gridFiles) {
    'ngInject';

    return {
        createProjectRoot: function(project) {
            var topEntries = {
                name: project.name,
                path: project.name,
                otype: 'directory',
                id: project.id,
                children: [
                    {
                        name: 'Files',
                        path: 'Files',
                        otype: 'directory',
                        id: 'files__' + project.id
                    },

                    {
                        name: 'Samples',
                        path: 'Samples',
                        otype: 'directory',
                        id: 'samples__' + project.id
                    },

                    {
                        name: 'Processes',
                        path: 'Processes',
                        otype: 'directory',
                        id: 'processes__' + project.id
                    }
                ]
            };

            return gridFiles.toGrid(topEntries);
        }
    };
}
