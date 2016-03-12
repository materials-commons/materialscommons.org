(function (module) {
    module.factory('gridFiles', gridFiles);

    function gridFiles() {
        function compareFileEntry(fentry1, fentry2) {
            if (fentry1.name < fentry2.name) {
                return -1;
            } else if (fentry1.name > fentry2.name) {
                return 1;
            } else {
                return 0;
            }
        }

        function createGridChildren(filesChildren) {
            var children = [];
            filesChildren.forEach(function (entry) {
                var centry;
                if (entry._type == 'directory') {
                    centry = createDirectoryEntry(entry);
                } else if (entry._type == 'file') {
                    centry = createFileEntry(entry);
                } else {
                    centry = createOtherEntry(entry);
                }
                children.push(centry);
            });
            return children;
        }

        function createDirectoryEntry(entry) {
            return {
                expanded: false,
                data: {
                    name: entry.name,
                    path: entry.path,
                    _type: 'directory',
                    id: entry.id,
                    size: '',
                    childrenLoaded: false
                },
                children: []
            };
        }

        function createFileEntry(entry) {
            return {
                data: {
                    name: entry.name,
                    _type: 'file',
                    path: entry.path,
                    size: entry.size,
                    mediatype: entry.mediatype,
                    id: entry.id,
                    icon: 'fa-files-o'
                }
            };
        }

        function createOtherEntry(entry) {
            return {
                data: {
                    name: entry.name,
                    _type: entry._type,
                    id: entry.id,
                    icon: toIcon(entry._type)
                }
            };
        }

        function toIcon(_type) {
            switch (_type) {
                case 'sample': return 'fa-cubes';
                case 'process': return 'fa-code-fork';
                case 'file': return 'fa-files-o';
                default: return 'fa-files-o';
            }
        }

        return {
            toGrid: function (files) {
                var gridData = [
                    {
                        expanded: true,
                        data: {
                            name: files.name,
                            path: files.path,
                            _type: files._type,
                            id: files.id,
                            childrenLoaded: true
                        },
                        children: []
                    }
                ];
                files.children.sort(compareFileEntry);
                gridData[0].children = createGridChildren(files.children);
                return gridData;
            },

            toGridChildren(fentry) {
                fentry.children.sort(compareFileEntry);
                return createGridChildren(fentry.children);
            },

            findEntry(files, id) {
                var treeModel = new TreeModel(),
                    root = treeModel.parse(files);
                return root.first({strategy: 'pre'}, function (node) {
                    return node.model.data.id === id;
                });
            }
        }
    }
}(angular.module('materialscommons')));
