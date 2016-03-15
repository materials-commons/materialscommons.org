angular.module('mc.project').directive('selectItemsFiles', selectItemsFilesDirective);
function selectItemsFilesDirective() {
    return {
        restrict: 'E',
        scope: {
            files: '='
        },
        controller: SelectItemsFilesDirectiveController,
        controllerAs: 'ctrl',
        bindToController: true,
        templateUrl: 'app/project/components/select-items/select-items-files.html'
    }
}

function SelectItemsFilesDirectiveController(projectsService, gridFiles, fileType, project, mcmodal) {
    'ngInject';

    var ctrl = this;

    var proj = project.get();
    ctrl.gridShowingFlag = true;
    ctrl.files[0].expanded = true;
    ctrl.directorySelected = directorySelected;
    ctrl.openFile = openFile;
    init();

    ///////////////

    function init() {
        var columnDefs = [
            {
                headerName: "",
                field: "name",
                width: 650,
                cellRenderer: {
                    renderer: 'group',
                    innerRenderer: function(params) {
                        var icon = fileType.icon(params.data);
                        if (params.data._type == 'directory') {
                            return [
                                '<a ng-click="data.selected = !data.selected; ctrl.directorySelected(data);">',
                                '<i ng-if="data.selected" class="fa fa-2x fa-fw fa-check text-success"></i>',
                                '<i ng-if="!data.selected" class="fa fa-2x fa-fw fa-square-o"></i>',
                                '</a>',
                                '<span' + ' id="' + params.data.id + '">' + params.data.name + '</span>'
                            ].join(' ');
                        }

                        return [
                            '<a ng-click="data.selected = !data.selected">',
                            '<i ng-if="data.selected" class="fa fa-2x fa-fw fa-check text-success"></i>',
                            '<i ng-if="!data.selected" class="fa fa-2x fa-fw fa-square-o"></i>',
                            '</a>',
                            '<i style="color: #D2C4D5;" class="fa fa-fw ' + icon + '"></i><span ng-click="ctrl.openFile(data)" title="',
                            params.data.name + '">' + params.data.name + '</span>'
                        ].join(' ');
                    }
                }
            }
        ];

        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: ctrl.files,
            rowClicked: rowClicked,
            rowSelection: 'single',
            rowsAlreadyGrouped: true,
            enableColResize: false,
            enableSorting: false,
            rowHeight: 30,
            angularCompileRows: true,
            icons: {
                groupExpanded: '<i style="color: #D2C4D5;" class="fa fa-folder-open"/>',
                groupContracted: '<i style="color: #D2C4D5" class="fa fa-folder"/>'
            }
        };
    }

    function rowClicked(params) {
        if (params.data._type == 'directory') {
            handleDirectory(params);
        }
    }

    function directorySelected(data) {
        var treeModel = new TreeModel(),
            root = treeModel.parse(proj.files[0]);
        var dir = root.first({strategy: 'pre'}, function(node) {
            return node.model.data.id === data.id;
        });
        dir.model.children.forEach(function(c) {
            if (c.data._type == 'file') {
                c.data.selected = data.selected;
            }
        });
    }

    function openFile(file) {
        mcmodal.openModal(file, 'datafile', proj);
    }

    function handleDirectory(params) {
        if (!params.data.childrenLoaded) {
            projectsService.getProjectDirectory(proj.id, params.data.id).then(function(files) {
                var treeModel = new TreeModel(),
                    root = treeModel.parse(proj.files[0]);
                var dir = root.first({strategy: 'pre'}, function(node) {
                    return node.model.data.id === params.data.id;
                });
                dir.model.children = gridFiles.toGridChildren(files);
                dir.model.children.forEach(function(c) {
                    if (c.data._type == 'file') {
                        c.data.selected = params.data.selected;
                    }
                });
                dir.model.data.childrenLoaded = true;
                ctrl.gridOptions.api.onNewRows();
                ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
            });
        } else {
            ctrl.gridShowingFlag = !ctrl.gridShowingFlag;
        }
    }
}
