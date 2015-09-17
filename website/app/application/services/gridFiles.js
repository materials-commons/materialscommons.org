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
                } else {
                    centry = createFileEntry(entry);
                }
                children.push(centry);
            });
            return children;
        }

        function createDirectoryEntry(entry) {
            return {
                group: true,
                expanded: false,
                data: {
                    name: entry.name,
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
                group: false,
                data: {
                    name: entry.name,
                    _type: 'file',
                    size: bytesToSizeStr(entry.size),
                    mediatype: entry.mediatype,
                    id: entry.id
                }
            };
        }

        return {
            toGrid: function (files) {
                var gridData = [
                    {
                        group: true,
                        expanded: true,
                        data: {
                            name: files.name,
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
            }
        }
    }
}(angular.module('materialscommons')));
