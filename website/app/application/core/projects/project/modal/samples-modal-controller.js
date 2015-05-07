Application.Directives.directive('modalSamples', modalSamplesDirective);

function modalSamplesDirective() {
    return {
        restrict: "A",
        controller: 'modalSamplesController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/modal/samples-modal.html'
    };
}

Application.Controllers.controller("modalSamplesController",
    ["$scope", "Review", "$modal", "pubsub",
        modalSamplesController]);

function modalSamplesController($scope, Review , $modal, pubsub) {

    var rowData = [];
    $scope.project.samples.forEach(function (sample) {
        var composition = '';
        sample.properties.composition.value.forEach(function (val) {
            composition = composition + '  ' + val.element + ': ' + val.value;
        })
        composition = composition + '  ' + sample.properties.composition.unit;
        rowData.push({
            name: sample.name,
            composition: composition,
            owner: sample.owner,
            mtime: sample.mtime
        });
    });
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
            field: "title",
            width: 600,
            template: '<span ng-bind="data.name"></span>' +
            '<p class="text-muted"><small><small  class="text-muted">{{data.composition}}</small>' +
            '<i style="padding-left: 60px; class="fa fa-fw fa-user"></i>' +
            '<span  class="text-muted">{{data.owner}}</span>' +
            '<small  style="padding-left: 60px;">{{data.mtime | toDateString}}</small></small></p>',
            cellStyle: {border: 0}
        }
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: $scope.project.samples,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 65,
        rowStyle: {'border-bottom': 'dotted #d3d3d3'},
        angularCompileRows: true,
        rowSelection: 'multiple',
        ready: readyFunc,
        cellClicked: cellClickedFunc,
        rowSelected: function (process) {
            Review.checkedItems(process);
            pubsub.send('addSampleToReview', process);
        },
        suppressRowClickSelection: true
    };

    function cellClickedFunc(params) {
        $scope.modal = {
            instance: null,
            process: params.data
        };

        $scope.modal.instance = $modal.open({
            template: '<display-sample modal="modal"></display-sample>',
            scope: $scope,
            size: 'lg'
        });
    }

    function readyFunc() {
        var i ;
        var checked_entries = Review.getCheckedItems();
        checked_entries.forEach(function(entry){
            i = _.indexOf($scope.gridOptions.rowData, function (item) {
                return item.id === entry.id;
            });
            if (i > -1){
                $scope.gridOptions.api.selectIndex(i, true, true);
            }
        });
    }
}
