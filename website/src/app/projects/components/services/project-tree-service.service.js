(function(module) {
    module.factory('projectTreeService', projectTreeService);
    projectTreeService.$inject = ['gridFiles'];
    function projectTreeService(gridFiles) {
        return {
            createProjectRoot: function(project) {
                var topEntries = {
                    name: project.name,
                    path: project.name,
                    _type: 'directory',
                    id: project.id,
                    children: [
                        {
                            name: 'Files',
                            path: 'Files',
                            _type: 'directory',
                            id: 'files__' + project.id
                        },

                        {
                            name: 'Samples',
                            path: 'Samples',
                            _type: 'directory',
                            id: 'samples__' + project.id
                        },

                        {
                            name: 'Processes',
                            path: 'Processes',
                            _type: 'directory',
                            id: 'processes__' + project.id
                        }
                    ]
                };

                return gridFiles.toGrid(topEntries);
            }
        };
    }
}(angular.module('materialscommons')));
