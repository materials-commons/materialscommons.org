(function (module) {
    module.directive('modalFiles', modalFilesDirective);
    function modalFilesDirective() {
        return {
            restrict: "A",
            controller: 'modalFilesDirectiveController',
            scope: {
                project: '=project'

            },
            templateUrl: 'application/core/projects/project/modal/files-modal.html'
        };
    }

    module.controller("modalFilesDirectiveController", modalFilesDirectiveController);
    modalFilesDirectiveController.$inject = ["$scope", "projectFiles", "$filter", "Review", "pubsub", "$modal",
            "mcapi", "mcfile", "mcmodal"];

    function modalFilesDirectiveController($scope, projectFiles, $filter, Review, pubsub,
                                           $modal, mcapi, mcfile, mcmodal) {
        $scope.modalState = {
            showTree: true,
            query: ""
        };
        $scope.search = search;
        $scope.fileSrc = mcfile.src;
        $scope.openFilePopup = openFilePopup;
        $scope.isImage = isImage;

        var f = projectFiles.model.projects[$scope.project.id].dir;
        f.showDetails = true;
        $scope.files = [f];
        $scope.files[0].expanded = true;
        $scope.files[0].children = $filter('orderBy')($scope.files[0].children, 'displayname');
        $scope.files.showDetails = true;
        var columnDefs = [

            {
                displayName: "",
                field: "name",
                width: 550,
                checkboxSelection: true,
                cellRenderer: function (params) {
                    return '<i style="color: #BFBFBF;" class="fa fa-fw fa-file"></i><span>' +
                        '<a data-toggle="tooltip" data-placement="top" title="{{params.node.name}}">' +
                        params.node.name + '</a></span>';
                }
            }
        ];

        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: $scope.files,
            rowSelection: 'multiple',
            rowClicked: rowClicked,
            rowsAlreadyGrouped: true,
            rowHeight: 30,
            icons: {
                groupExpanded: '<i style="color: #D2C4D5 " class="fa fa-folder-open"/>',
                groupContracted: '<i style="color: #D2C4D5 " class="fa fa-folder"/>'
            },
            rowSelected: function (row) {
                Review.checkedItems(row);
                pubsub.send('addFileToReview', row);
            },
            suppressRowClickSelection: true,
            groupInnerCellRenderer: groupInnerCellRenderer
        };

        var searchColumnDefs = [
            {
                displayName: "",
                field: "name",
                checkboxSelection: true,
                cellRenderer: function (params) {
                    var imageHTML = '';
                    var contentHTML = '';

                    if (isImage(params.data._source.mediatype.mime)) {
                        imageHTML = [
                            '<a>',
                            '<img class="img-thumbnail" height="140" width="140"',
                            'src="' + mcfile.src(params.data._source.id) + '"></a>'
                        ].join(' ');
                    } else if (params.data._source.contents.length !== 0) {
                        var contents = $filter('truncate')(params.data._source.contents, 75, '...', true);
                        contentHTML = '<p>' + contents + '</p>';
                    }
                    return [
                        '<span>',
                        '<i class="fa fa-files-o fa-fw" style="color: #9F88C1;"></i>',
                        params.data._source.name,
                        params.data._source.mediatype.mime,
                        '</span>',
                        '<span class="row">Path:' + params.data._source.path + '</span>',
                        imageHTML,
                        contentHTML
                    ].join(' ');
                }
            }
        ];

        $scope.results = {
            hits: []
        };

        $scope.searchGridOptions = {
            columnDefs: searchColumnDefs,
            rowData: $scope.results.hits,
            rowSelected: function (row) {
                var f = projectFiles.findFileByID($scope.project.id, row._id);
                Review.checkedItems(f);
                pubsub.send('addFileToReview', f);
            },
            rowSelection: 'multiple',
            rowHeight: 150,
            colWidth: 500,
            angularCompileRows: false
        };

        function groupInnerCellRenderer(params) {
            return params.node.type === 'datadir' ? params.node.displayname : 'File';
        }

        function rowClicked(params) {
            if (params.node.type == 'datadir') {
                var file = projectFiles.findFileByID($scope.project.id, params.node.datafile_id);
                file.expanded = params.node.expanded;
                if (!params.node.sorted) {
                    file.children = $filter('orderBy')(file.children, 'displayname');
                    file.sorted = true;
                    $scope.gridOptions.api.onNewRows();
                }
            } else {
                $scope.modal = {
                    instance: null,
                    item: params.node
                };
                $scope.modal.item.id = params.node.datafile_id;
                $scope.modal.instance = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/core/projects/project/home/directives/display-file.html',
                    controller: 'ModalInstanceCtrl',
                    resolve: {
                        modal: function () {
                            return $scope.modal;
                        },
                        project: function () {
                            return $scope.project;
                        }
                    }
                });
            }
        }

        function search() {
            mcapi("/search/project/%/files", $scope.project.id)
                .success(function (results) {
                    $scope.modalState.showTree = false;
                    $scope.searchGridOptions.api.setRows(results.hits);
                })
                .post({query_string: $scope.modalState.query});
        }

        function openFilePopup(file) {
            var f = file;
            if ('datafile_id' in file) {
                // We don't have a full file object, so find it in projectFiles
                f = projectFiles.findFileByID($scope.project.id, file.datafile_id);
            }
            mcmodal.openModal(f, 'datafile', $scope.project);
        }
    }

}(angular.module('materialscommons')));
