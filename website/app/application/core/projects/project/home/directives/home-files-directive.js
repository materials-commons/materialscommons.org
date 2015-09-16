(function (module) {
    module.directive('homeFiles', homeFilesDirective);
    function homeFilesDirective() {
        return {
            restrict: "A",
            controller: 'HomeFilesDirectiveController',
            //controller: 'Home2Controller',
            controllerAs: 'files',
            bindToController: true,
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/home/directives/home-files.html'
        };
    }

    module.controller("Home2Controller", Home2Controller);
    Home2Controller.$inject = [];
    function Home2Controller() {
        var ctrl = this;
        var rowData = [
            {
                group: true,
                expanded: true,
                data: {name: 'C:'},
                children: [
                    {group: true,
                        data: {name: 'Windows', size: '', type: 'File Folder', dateModified: '27/02/2014 04:12'},
                        children: [
                            {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                            {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                            {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                        ]
                    },
                    {group: true,
                        data: {name: 'Program Files', size: '', type: 'File Folder', dateModified: '11/09/2013 02:11'},
                        expanded: true,
                        children: [
                            {group: true,
                                data: {name: 'ASUS', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                children: [
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            },
                            {group: true,
                                data: {name: 'Classic Shell', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                children: [
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            },
                            {group: true,
                                data: {name: 'Common Files', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                children: [
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            },
                            {group: true,
                                data: {name: 'DisplayLink Core Software', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                children: [
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            },
                            {group: true,
                                data: {name: 'Intel', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                children: [
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            },
                            {group: true,
                                data: {name: 'Internet Explorer', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                children: [
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            },
                            {group: true,
                                data: {name: 'Intel Corporation', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                children: [
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            },
                            {group: true,
                                data: {name: 'Java', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                expanded: true,
                                children: [
                                    {group: true,
                                        data: {name: 'jdk1.8.0', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                        children: [
                                            {group: false, data: {name: 'java.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                            {group: false, data: {name: 'javac.exe', size: '1 kb', type: 'Application', dateModified: '27/11/2012 04:12'}},
                                            {group: false, data: {name: 'weblaunch.exe', size: '21 kb', type: 'Application', dateModified: '18/03/2014 00:56'}}
                                        ]
                                    },
                                    {group: true,
                                        data: {name: 'jre1.8.0_31', size: '', type: 'File Folder', dateModified: '13/03/2014 1014'},
                                        children: [
                                            {group: false, data: {name: 'java.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                            {group: false, data: {name: 'javac.exe', size: '1 kb', type: 'Application', dateModified: '27/11/2012 04:12'}},
                                            {group: false, data: {name: 'weblaunch.exe', size: '21 kb', type: 'Application', dateModified: '18/03/2014 00:56'}}
                                        ]
                                    },
                                    {group: false, data: {name: 'bfsve.exe', size: '56 kb', type: 'Application', dateModified: '13/03/2014 10:14'}},
                                    {group: false, data: {name: 'csup.txt', size: '1 kb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                                    {group: false, data: {name: 'diagwrn.xml', size: '21 kb', type: 'XML File', dateModified: '18/03/2014 00:56'}}
                                ]
                            }
                        ]},
                    {group: false, data: {name: 'boot.ini', size: '16 kb', type: 'Boot File', dateModified: '27/11/2012 04:12'}},
                    {group: false, data: {name: 'system.cfg', size: '13 kb', type: 'System File', dateModified: '18/03/2014 00:56'}}
                ]
            },
            {
                group: true,
                data: {name: 'D:'},
                children: [
                    {group: false, data: {name: 'Game of Thrones s05e01.avi', size: '1034 mb', type: 'Movie', dateModified: '13/03/2014 10:14'}},
                    {group: false, data: {name: 'The Knick s01e01', size: '523 mb', type: 'Text Document', dateModified: '27/11/2012 04:12'}},
                    {group: false, data: {name: 'musicbackup1.zip', size: '25 mb', type: 'Compressed Zip File', dateModified: '18/03/2014 00:56'}},
                    {group: false, data: {name: 'musicbackup2.zip', size: '25 mb', type: 'Compressed Zip File', dateModified: '18/03/2014 00:56'}}
                ]
            }
        ];

        var columnDefs = [
            {headerName: "Name", field: "name", width: 250,
                cellRenderer: {
                    renderer: 'group',
                    innerRenderer: innerCellRenderer
                }},
            {headerName: "Size", field: "size", width: 70, cellStyle: sizeCellStyle},
            {headerName: "Type", field: "type", width: 150},
            {headerName: "Date Modified", field: "dateModified", width: 150}
        ];

        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            rowSelection: 'multiple',
            rowsAlreadyGrouped: true,
            enableColResize: true,
            enableSorting: true,
            rowHeight: 20,
            icons: {
                groupExpanded: '<i class="fa fa-minus-square-o"/>',
                groupContracted: '<i class="fa fa-plus-square-o"/>'
            },
            rowClicked: rowClicked
        };
        ctrl.selectedFile = 'Select a file below...';

        function rowClicked(params) {
            var node = params.node;
            var path = node.data.name;
            while (node.parent) {
                node = node.parent;
                path = node.data.name + '\\' + path;
            }
            ctrl.selectedFile = path;
        }

        function sizeCellStyle() {
            return {'text-align': 'right'};
        }

        function innerCellRenderer(params) {
            return params.data.name;
            var image;
            if (params.node.group) {
                image = params.node.level === 0 ? 'disk' : 'folder';
            } else {
                image = 'file';
            }
            var imageFullUrl = '/example-file-browser/' + image + '.png';
            return '<img src="'+imageFullUrl+'" style="padding-left: 4px;" /> ' + params.data.name;
        }
    }

    module.controller("HomeFilesDirectiveController", HomeFilesDirectiveController);
    HomeFilesDirectiveController.$inject = ["projectFiles", "$filter", "$modal"];

    /* @ngInject */
    function HomeFilesDirectiveController(projectFiles, $filter, $modal) {
        var ctrl = this;

        //console.log('HomeFilesDirectiveController %O', ctrl.project);
        //var f = projectFiles.model.projects[ctrl.project.id].dir;
        //
        //// Root is name of project. Have it opened by default.
        //f.showDetails = true;
        //ctrl.files = [f];
        //ctrl.files[0].expanded = true;
        //ctrl.files[0].children = $filter('orderBy')(ctrl.files[0].children, 'displayname');
        //ctrl.files.showDetails = true;
        var f = this.project.files;
        //console.dir(f);
        f.showDetails = true;
        ctrl.files = f;

        var columnDefs = [
            {
                headerName: "",
                field: "name",
                width: 350,
                cellRenderer: {
                    renderer: 'group',
                    innerRenderer: function(params) {
                        return '<span>'+params.data.name+'</span>';
                    }
                }
                //cellRenderer: function (params) {
                //    return '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span>' +
                //        '<a data-toggle="tooltip" data-placement="top" title="{{params.node.data.name}}">' +
                //        params.node.data.name + '</a></span>';
                //}
            }
        ];

        var rowData = [
            {
                group: true,
                expanded: true,
                data: {name: 'C:'},
                children: [
                    {
                        group: true,
                        data: {name: 'Windows'},
                        children: [
                            {group: false, data: {name: 'abc1.txt'}},
                            {group: false, data: {name: 'abc2.txt'}}
                        ]
                    }
                ]
            }
        ];

        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            rowClicked: rowClicked,
            rowsAlreadyGrouped: true,
            enableColResize: true,
            enableSorting: true,
            rowHeight: 30,
            angularCompileRows: true,
            icons: {
                groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
                groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'
            }
            //groupInnerCellRenderer: groupInnerCellRenderer
        };

        function groupInnerCellRenderer(params) {
            return params.node._type === 'directory' ? params.node.data.name : 'File';
        }

        function rowClicked(params) {
            console.dir(params);
            if (params.node.type == 'datadir') {
                var file = projectFiles.findFileByID($scope.project.id, params.node.datafile_id);
                file.expanded = params.node.expanded;
                if (!params.node.sorted) {
                    file.children = $filter('orderBy')(file.children, 'displayname');
                    file.sorted = true;
                    ctrl.gridOptions.api.onNewRows();
                }
            } else {
                ctrl.modal = {
                    instance: null,
                    item: params.node
                };
                ctrl.modal.item.id = params.node.datafile_id;
                ctrl.modal.instance = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/core/projects/project/home/directives/display-file.html',
                    controller: 'ModalInstanceCtrl',
                    resolve: {
                        modal: function () {
                            return ctrl.modal;
                        },
                        project: function () {
                            return ctrl.project;
                        }
                    }
                });
            }
        }
    }
}(angular.module('materialscommons')));
