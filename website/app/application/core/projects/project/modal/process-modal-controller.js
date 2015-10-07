(function (module) {
    module.directive('modalProcesses', modalProcessesDirective);
    function modalProcessesDirective() {
        return {
            restrict: "EA",
            controller: 'modalProcessesDirectiveController',
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/modal/process-modal.html'
        };
    }

    module.controller("modalProcessesDirectiveController", modalProcessesDirectiveController);
    modalProcessesDirectiveController.$inject = ["$scope", "$modal", "pubsub", "Review"];

    function modalProcessesDirectiveController($scope, $modal, pubsub, Review) {
        $scope.bk = {all: []};
        $scope.project.processes.forEach(function (process) {
            $scope.bk.all.push(process);
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
        var rowData = [];
        $scope.project.processes.forEach(function (process) {
            process.type = 'process';
            rowData.push(process);
        });


        $scope.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            enableColResize: true,
            headerHeight: 0,
            rowHeight: 60,
            angularCompileRows: true,
            rowSelection: 'multiple',
            ready: readyFunc,
            //cellClicked: cellClickedFunc,
            rowSelected: function (process) {
                Review.checkedItems(process.node.data);
                pubsub.send('addProcessToReview', process.node.data);
            },
            suppressRowClickSelection: true
        };

        function cellClickedFunc(params) {
            $scope.modal = {
                instance: null,
                item: params.data
            };

            $scope.modal.instance = $modal.open({
                size: 'lg',
                templateUrl: 'application/core/projects/project/home/directives/display-process.html',
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

}(angular.module('materialscommons')));
