(function(module) {


    module.directive("displayProperty", displayPropertyDirective);

    function displayPropertyDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/display-property.html"
        };
    }

    module.directive("propertyNumber", propertyNumberDirective);
    function propertyNumberDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/property-number.html"
        };
    }

    module.directive("propertyString", propertyStringDirective);
    function propertyStringDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/property-string.html"
        };
    }

    module.directive("propertyPair", propertyPairDirective);
    function propertyPairDirective() {
        return {
            restrit: "E",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/property-pair.html"
        };
    }

    module.directive("propertySelection", propertySelectionDirective);
    function propertySelectionDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/property-selection.html"
        };
    }

    module.directive("propertyComposition", propertyCompositionDirective);
    function propertyCompositionDirective() {
        return {
            restrict: "E",
            controller: "propertyCompositionController",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/property-composition.html"
        };
    }

    module.controller("propertyCompositionController",
        ["$scope", "mcapi", propertyCompositionController]);

    function propertyCompositionController($scope, mcapi) {
        $scope.elements = [];
        $scope.property.unit = 'wt%';  //setting default unit
        if ($scope.property.value === null) {
            $scope.property.value = {'elements': "", 'values': ""};
        }
        mcapi('/objects/elements')
            .success(function (data) {
                $scope.elements = data;
            }).jsonp();

        $scope.addElement = function(){
            $scope.property.value.elements = $scope.property.value.elements + $scope.property.element + "\n";
        }

    }

    module.directive("propertyList", propertyListDirective);
    function propertyListDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/property-list.html"
        };
    }

    module.directive("propertyHistogram", propertyHistogramDirective);
    function propertyHistogramDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            controller: "propertyHistogramDirectiveController",
            templateUrl: "application/core/components/properties/partials/property-histogram.html"
        };
    }

    module.controller("propertyHistogramDirectiveController",
        ["$scope", propertyHistogramDirectiveController]);
    function propertyHistogramDirectiveController($scope) {
        var categories = [];
        var seriesData = [];

        $scope.histogramConfig = {
            options: {
                title: {
                    text: $scope.attribute
                },
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

        $scope.afterSelection = function (startRow, startColumn, endRow, endColumn) {
            selectedStartRow = startRow;
            selectedStartColumn = startColumn;
            selectedEndRow = endRow;
            selectedEndColumn = endColumn;
        };

        $scope.afterSelectionSubmit = function () {
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

        $scope.submit = function () {
            categories = $scope.xValues.split(",");
            seriesData = [];
            $scope.yValues.split(",").forEach(function (val) {
                seriesData.push(parseInt(val, 10));
            });
            $scope.histogramConfig.xAxis.categories = categories;
            $scope.histogramConfig.series[0].data = seriesData;
        };

        $scope.measurement = {
            categories: "",
            values: "",
            splitCategories: [],
            splitValues: []
        };

        $scope.submitMeasurement = function () {
            $scope.measurement.splitCategories = $scope.measurement.categories.split("\n");
            $scope.measurement.splitValues = [];
            $scope.measurement.values.split("\n").forEach(function (value) {
                $scope.measurement.splitValues.push(parseInt(value, 10));
            });
        };

        $scope.viewInGraph = function () {
            $scope.showMeasurementGraph = !$scope.showMeasurementGraph;
            if ($scope.showMeasurementGraph) {
                $scope.submitMeasurement();
                $scope.histogramMeasurementConfig.xAxis.categories = $scope.measurement.splitCategories;
                $scope.histogramMeasurementConfig.series[0].data = $scope.measurement.splitValues;
            }
        };

    }

    module.directive("propertyLine", propertyLineDirective);
    function propertyLineDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            controller: "propertyLineDirectiveController",
            templateUrl: "application/core/components/properties/partials/property-line.html"
        };
    }

    module.controller("propertyLineDirectiveController",
        ["$scope", propertyLineDirectiveController]);
    function propertyLineDirectiveController($scope) {
        $scope.linechartConfig = {
            options: {
                chart: {
                    type: "areaspline"
                },
                plotOptions: {
                    series: {
                        stacking: ""
                    }
                }
            },
            xAxis: {
                categories: [1, 2, 3, 4, 5, 6]
            },
            series: [
                {
                    data: [10, 20, 30, 40, 50],
                    type: "line"
                }]
        };
    }

    module.directive("propertyFraction", propertyFractionDirective);
    function propertyFractionDirective() {
        return {
            restrict: "E",
            scope: {
                property: "=property"
            },
            templateUrl: "application/core/components/properties/partials/property-fraction.html"
        }
    }

}(angular.module('materialscommons')));
