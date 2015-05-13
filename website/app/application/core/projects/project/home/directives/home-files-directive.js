Application.Directives.directive('homeFiles', homeFilesDirective);
function homeFilesDirective() {
    return {
        restrict: "A",
        controller: 'homeFilesDirectiveController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-files.html'
    };
}

Application.Controllers.controller("homeFilesDirectiveController",
    ["$scope", "ui", "projectFiles", "applySearch",
        "$filter", "mcapi", homeFilesDirectiveController]);
function homeFilesDirectiveController($scope, ui, projectFiles, applySearch,
                                      $filter, mcapi) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    f.showDetails = true;
    $scope.files = [f];
    $scope.files.showDetails = true;

    var columnDefs = [

        {
            displayName: "",
            field: "name",
            width: 350,
            template: '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span ng-bind="data.name"></span>'
        },
        {displayName: "", field: "size", width: 250},
        {displayName: "", field: "dateModified", width: 250}
    ];
    var rowData = [

        {
            group: true,
            data: {name: 'Windows', size: '20kb', type: 'datadir', dateModified: '27/02/2014 04:12'},
            children: [
                {
                    group: true,
                    data: {
                        name: 'bfsve.exe',
                        size: '56 kb',
                        type: 'datadir',
                        dateModified: '13/03/2014 10:14'
                    },
                    children: [
                        {
                            group: false,
                            data: {
                                name: '1.txt',
                                size: '56 kb',
                                type: 'datafile',
                                dateModified: '13/03/2014 10:14'
                            }
                        },

                        {
                            group: false,
                            data: {
                                name: '2.txt',
                                size: '1 kb',
                                type: 'datafile',
                                dateModified: '27/11/2012 04:12'
                            }
                        },

                        {
                            group: false,
                            data: {
                                name: '3.xml',
                                size: '21 kb',
                                type: 'datafile',
                                dateModified: '18/03/2014 00:56'
                            }
                        }]

                },

                {
                    group: false,
                    data: {
                        name: 'csup.txt',
                        size: '1 kb',
                        type: 'datafile',
                        dateModified: '27/11/2012 04:12'
                    }
                },

                {
                    group: false,
                    data: {
                        name: 'diagwrn.xml',
                        size: '21 kb',
                        type: 'datafile',
                        dateModified: '18/03/2014 00:56'
                    }
                }]

        }
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        rowSelection: 'multiple',
        rowsAlreadyGrouped: true,
        enableColResize: true,
        enableSorting: true,
        rowHeight: 30,
        angularCompileRows: true,
        icons: {
            groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
            groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'

        },
        groupInnerCellRenderer: groupInnerCellRenderer
        //rowClicked: rowClicked
    };

    //function rowClicked(params) {
    //    var node = params.node;
    //    var path = node.data.name;
    //    while (node.parent) {
    //        node = node.parent;
    //        path = node.data.name  + '\\' + path;
    //    }
    //    $scope.selectedFile = path;
    //}


    function groupInnerCellRenderer(params) {
        if (params.data.type === 'datadir') {
            return '' + params.data.name;
        }
        //var image = params.node.level === 0 ? 'disk' : 'folder';
        //var imageFullUrl = '/example-file-browser/' + image + '.png';
        //return '<img src="'+imageFullUrl+'" style="padding-left: 4px;" /> ' + params.data.name;
    }

}
