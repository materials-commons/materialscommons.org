(function (module) {
    module.controller('lineGraphController', lineGraphController);
    lineGraphController.$inject = ["$scope", "modal", "$log", "project"];

    function lineGraphController($scope, modal, $log, project) {
        $scope.modal = modal;
        $scope.project = project;
        $scope.chartObject = {};
        $scope.selected = {
            item: {}
        };
        processColumns();
        $scope.ok = function () {
            $scope.modal.instance.close($scope.selected.item);
        };

        $scope.cancel = function () {
            $scope.modal.instance.dismiss('cancel');
        };

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });

        function processColumns() {
            $scope.categories = $scope.modal.property.value.categories.split("\n");
            $scope.values = $scope.modal.property.value.values.split("\n");
            $scope.chartObject.data = {
                "cols": [
                    {id: "x", label: "Categories", type: "string"},
                    {id: "y", label: "Values", type: "number"}
                ],
                "rows": []
            };

            for (var i = 0; i < $scope.categories.length; i++) {
                $scope.chartObject.data.rows.push({c: [{v: $scope.categories[i]}, {v: $scope.values[i]}]});
            }
        }

        $scope.chartObject.type = 'LineChart';
        $scope.chartObject.options = {
            'title': 'Line Graph',
            "vAxis": {
                "title": "Values"
            },
            "hAxis": {
                "title": "Categories"
            }
        };

    }
}(angular.module('materialscommons')));

