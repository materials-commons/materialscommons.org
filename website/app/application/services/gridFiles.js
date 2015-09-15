(function(module) {
    module.factory('gridFiles', gridFiles);

    function gridFiles() {
        return {
            toGrid: function(files) {
                var children = [];
                var gridData = [
                    {
                        group: true,
                        expanded: true,
                        data: {
                            name: files.name,
                            _type: files._type,
                            id: files.id
                        },
                        children: children
                    }
                ];
                files.children.sort(function(entry1, entry2) {
                    if (entry1.name < entry2.name) {
                        return -1;
                    } else if (entry1.name > entry2.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                files.children.forEach(function(entry) {
                    var centry;
                    if (entry._type == 'directory') {
                        centry = {
                            group: true,
                            expanded: false,
                            data: {
                                name: entry.name,
                                _type: 'directory',
                                id: entry.id
                            }
                        };
                    } else {
                        centry = {
                            group: false,
                            data: {
                                name: entry.name,
                                _type: 'file',
                                id: entry.id
                            }
                        };
                    }
                    children.push(centry);
                });
                return gridData;
            }
        }
    }
}(angular.module('materialscommons')));
