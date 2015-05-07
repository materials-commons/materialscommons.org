Application.Directives.directive('modalFiles', modalFilesDirective);
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

Application.Controllers.controller("modalFilesDirectiveController",
    ["$scope", "pubsub", "projectFiles", "applySearch","$modal",
        "$filter",  "mcapi", modalFilesDirectiveController]);
function modalFilesDirectiveController($scope, pubsub, projectFiles, applySearch, $modal,
                                      $filter, mcapi) {
    var f = projectFiles.model.projects[$scope.project.id].dir;

    // Root is name of project. Have it opened by default.
    f.showDetails = true;
    $scope.files = [f];

    $scope.isReloading = false;
    $scope.reloadFiles = function() {
        $scope.isReloading = !$scope.isReloading;
        mcapi("/projects/%/tree2", $scope.project.id)
            .success(function(files){
                var obj = {};
                obj.dir = files[0];
                projectFiles.model.projects[$scope.project.id] = obj;
                // obj.dir is root of project. Have it opened by default.
                obj.dir.showDetails = true;
                $scope.files = [projectFiles.model.projects[$scope.project.id].dir];
                projectFiles.loadByMediaType($scope.project);
                $scope.isReloading = false;
            }).jsonp();
    };

    applySearch($scope, "searchInput", applyQuery);
    var columnDefs = [
        {
            displayName: "",
            field: "selected",
            width: 100,
            checkboxSelection: true,
            cellStyle: {border: 0}
        },
        {
            displayName: "",
            field: "name",
            width: 300,
            cellClicked: cellClickedFunc,
            template: '<span><a>{{data.name}}</a></span>' +
            '<p><small><small  class="text-muted">{{data.mtime | toDateString}}</small></small></p>',
            cellStyle: {border: 0}
        },
        {
            displayName: "",
            field: "owner",
            width: 300,
            cellTemplate: '<span ng-bind="data.owner"></span>',
            cellStyle: {border: 0}
        },
        {displayName: "", field: "", width: 300, cellStyle: {border: 0}}
    ];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: $scope.files,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 60,
        angularCompileRows: true,
        rowSelection: 'multiple',
        ready: readyFunc,
        rowSelected: function (file) {
            Review.checkedItems(file);
            pubsub.send('addFileToReview', file);
        },
        suppressRowClickSelection: true
    };
    function cellClickedFunc(params) {
        $scope.modal = {
            instance: null,
            process: params.data
        };

        $scope.modal.instance = $modal.open({
            template: '<display-process modal="modal"></display-process>',
            scope: $scope,
            size: 'lg'
        });
    }
    function readyFunc() {
        var i1 ;
        var checked_entries = Review.getCheckedItems();
        checked_entries.forEach(function(entry){
            i1 = _.indexOf($scope.gridOptions.rowData, function (item) {
                return item.id === entry.id;
            });
            $scope.gridOptions.api.selectIndex(i1, true, true);
        });
    }
    function applyQuery() {
        var search = {
            name: ""
        };

        if ($scope.searchInput === "") {
            $scope.files = [projectFiles.model.projects[$scope.project.id].dir];
        } else {
            var filesToSearch = projectFiles.model.projects[$scope.project.id].byMediaType.all;
            search.name = $scope.searchInput;
            $scope.files = $filter('filter')(filesToSearch, search);
        }
    }

}
