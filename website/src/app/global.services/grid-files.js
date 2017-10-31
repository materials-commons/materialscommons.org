/*@ngInject*/
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
        const children = [];
        filesChildren.forEach(function(entry) {
            let centry;
            if (entry.otype == 'directory') {
                centry = createDirectoryEntry(entry);
            } else if (entry.otype == 'file') {
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
                otype: 'directory',
                id: entry.id,
                size: '',
                childrenLoaded: false
            },
            children: []
        };
    }

    function createFileEntry(entry) {
        return {
            expanded: false,
            data: {
                name: entry.name,
                otype: 'file',
                path: entry.path,
                size: entry.size,
                mediatype: entry.mediatype,
                id: entry.id,
                icon: 'fa-files-o'
            },
            children: []
        };
    }

    function createOtherEntry(entry) {
        return {
            expanded: false,
            data: {
                name: entry.name,
                otype: entry.otype,
                id: entry.id,
                icon: toIcon(entry.otype)
            },
            children: []
        };
    }

    function toIcon(otype) {
        switch (otype) {
        case 'sample':
            return 'fa-cubes';
        case 'process':
            return 'fa-code-fork';
        case 'file':
            return 'fa-files-o';
        default:
            return 'fa-files-o';
        }
    }

    return {
        toGrid: function(files) {
            const gridData = [
                {
                    expanded: true,
                    data: {
                        name: files.name,
                        path: files.path,
                        otype: files.otype,
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
            const treeModel = new TreeModel(),
                root = treeModel.parse(files);
            return root.first({strategy: 'pre'}, function(node) {
                return node.model.data.id === id;
            });
        },

        createDirectoryEntry,
        createFileEntry
    }
}

angular.module('materialscommons').factory('gridFiles', gridFiles);
