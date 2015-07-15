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
    ["$scope", "Review", "$modal", "pubsub", "mcapi",
        modalSamplesController]);

function modalSamplesController($scope, Review, $modal, pubsub, mcapi) {

    var rowData = [];
    $scope.project.samples.forEach(function (sample) {
        //var composition = '';
        //if ('composition' in sample.properties) {
        //    sample.properties.composition.value.forEach(function (val) {
        //        composition = composition + '  ' + val.element + ': ' + val.value;
        //    });
        //    composition = composition + '  ' + sample.properties.composition.unit;
        //} else {
        //    composition = 'unknown';
        //}
        rowData.push({
            name: sample.name,
            //composition: composition,
            owner: sample.owner,
            mtime: sample.mtime,
            properties: sample.properties,
            //notes: sample.notes,
            id: sample.id,
            type: 'sample',
            property_set_id: sample.property_set_id
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
            cellClicked: cellClickedFunc,
            template: '<span><a>{{data.name}}</a></span>' +
            '<p class="text-muted"><small>' +
            '<i class="fa fa-fw fa-user"></i>' +
            '<span  class="text-muted">{{data.owner}}</span>' +
            '<small  style="padding-left: 60px;">{{data.mtime | toDateString}}</small></small></p>',
            cellStyle: {border: 0}
        },
        {displayName: "", field: "", width: 300, cellStyle: {border: 0}}

    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 65,
        rowStyle: {'border-bottom': 'dotted #d3d3d3'},
        angularCompileRows: true,
        rowSelection: 'multiple',
        ready: readyFunc,
        rowSelected: function (sample) {
            Review.checkedItems(sample);
            pubsub.send('addSampleToReview', sample);
        },
        suppressRowClickSelection: true
    };

    function cellClickedFunc(params) {
        $scope.modal = {
            instance: null,
            item: params.data
        };
        mcapi('/sample/measurements/%/%', params.data.id, params.data.property_set_id)
            .success(function (properties) {
                params.data.properties = properties;
                $scope.modal.item = params.data;
            })
            .error(function (err) {
                console.log(err)
            })
            .jsonp();
        mcapi('/sample/datafile/%', params.data.id)
            .success(function (files) {
                $scope.modal.item.files = files;
            }).jsonp();

        $scope.modal.instance = $modal.open({
            size: 'lg',
            templateUrl: 'application/core/projects/project/home/directives/display-sample.html',
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

    function readyFunc() {
        var i;
        var checked_entries = Review.getCheckedItems();
        checked_entries.forEach(function (entry) {
            i = _.indexOf($scope.gridOptions.rowData, function (item) {
                return item.id === entry.id;
            });
            if (i > -1) {
                $scope.gridOptions.api.selectIndex(i, true, true);
            }
        });
    }
}
