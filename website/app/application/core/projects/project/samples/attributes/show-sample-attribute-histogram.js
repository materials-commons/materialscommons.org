Application.Directives.directive("showSampleAttributeHistogram", showSampleAttributeHistogramDirective);
function showSampleAttributeHistogramDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "showSampleAttributeHistogramDirectiveController",
        templateUrl: "application/core/projects/project/samples/attributes/show-sample-attribute-histogram.html"
    };
}

Application.Controllers.controller("showSampleAttributeHistogramDirectiveController",
                                   ["$scope", showSampleAttributeHistogramDirectiveController]);
function showSampleAttributeHistogramDirectiveController($scope) {
    var categories = [];
    var seriesData = [];

    $scope.histogramConfig = {
        options: {
            chart: {
                renderTo: "container",
                type: "column"
            },
            plotOptions: {
                column: {
                    groupPadding: 0,
                    pointPadding: 0,
                    borderWidth: 0
                }
            }
        },
        xAxis: {
            categories: categories
        },
        series: [
            {
                data: seriesData
            }
        ]
    };

    $scope.histogramMeasurementConfig = {
        options: {
            chart: {
                renderTo: "container",
                type: "column"
            },
            plotOptions: {
                column: {
                    groupPadding: 0,
                    pointPadding: 0,
                    borderWidth: 0
                }
            }
        },
        xAxis: {
            categories: []
        },
        series: [
            {
                data: []
            }
        ]
    };

    $scope.db = {
        items: []
    };
    for (var i = 0; i < 50; i++) {
        $scope.db.items.push({
            id: i,
            category: "c_" + i,
            value: i * 10
        });
    }

    var selectedStartRow = -1,
        selectedStartColumn = -1,
        selectedEndRow = -1,
        selectedEndColumn = -1;

    $scope.afterSelection = function(startRow, startColumn, endRow, endColumn) {
        selectedStartRow = startRow;
        selectedStartColumn = startColumn;
        selectedEndRow = endRow;
        selectedEndColumn = endColumn;
    };

    $scope.afterSelectionSubmit = function() {
        var startRow = selectedStartRow,
            startColumn = selectedStartColumn,
            endRow = selectedEndRow,
            endColumn = selectedEndColumn;

        var j;
        for (var i = startColumn; i <= endColumn; i++) {
            if (i === 0) {
                // Category
                categories = [];
                for (j = startRow; j <= endRow; j++) {
                    categories.push($scope.db.items[j].category);
                }
            } else {
                // Series
                seriesData = [];
                for (j = startRow; j <= endRow; j++) {
                    seriesData.push($scope.db.items[j].value);
                }
            }
        }
        $scope.histogramConfig.xAxis.categories = categories;
        $scope.histogramConfig.series[0].data = seriesData;
    };

    $scope.submit = function() {
        categories = $scope.xValues.split(",");
        seriesData = [];
        $scope.yValues.split(",").forEach(function(val) {
            seriesData.push(parseInt(val, 10));
        });
        console.dir(categories);
        console.dir(seriesData);
        $scope.histogramConfig.xAxis.categories = categories;
        $scope.histogramConfig.series[0].data = seriesData;
    };

    $scope.measurement = {
        categories: "",
        values: "",
        splitCategories: [],
        splitValues: []
    };

    $scope.submitMeasurement = function() {
        $scope.measurement.splitCategories = $scope.measurement.categories.split("\n");
        $scope.measurement.splitValues = [];
        $scope.measurement.values.split("\n").forEach(function(value) {
            $scope.measurement.splitValues.push(parseInt(value, 10));
        });
    };

    $scope.viewInGraph = function() {
        $scope.showMeasurementGraph = !$scope.showMeasurementGraph;
        if ($scope.showMeasurementGraph) {
            $scope.submitMeasurement();
            $scope.histogramMeasurementConfig.xAxis.categories = $scope.measurement.splitCategories;
            $scope.histogramMeasurementConfig.series[0].data = $scope.measurement.splitValues;
        }
    };

}
