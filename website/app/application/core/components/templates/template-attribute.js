Application.Directives.directive("templateAttribute", templateAttributeDirective);
function templateAttributeDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute.html"
    };
}
Application.Controllers.controller("templateAttributeDirectiveController",
                                   ["$scope",
                                    templateAttributeDirectiveController]);

function templateAttributeDirectiveController($scope) {
}

Application.Directives.directive("templateAttributeDetails", templateAttributeDetailsDirective);
function templateAttributeDetailsDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeDetailsDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-details.html"
    };
}
Application.Controllers.controller("templateAttributeDetailsDirectiveController",
                                   ["$scope",
                                    templateAttributeDetailsDirectiveController]);

function templateAttributeDetailsDirectiveController($scope) {
}

Application.Directives.directive("templateAttributeComposition", templateAttributeCompositionDirective);
function templateAttributeCompositionDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeCompositionDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-composition.html"
    };
}

Application.Controllers.controller("templateAttributeCompositionDirectiveController",
                                   ["$scope", templateAttributeCompositionDirectiveController]);
function templateAttributeCompositionDirectiveController($scope) {

}

Application.Directives.directive("templateAttributeHistogram", templateAttributeHistogramDirective);
function templateAttributeHistogramDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeHistogramDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-histogram.html"
    };
}

Application.Controllers.controller("templateAttributeHistogramDirectiveController",
                                   ["$scope", templateAttributeHistogramDirectiveController]);
function templateAttributeHistogramDirectiveController($scope) {
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

Application.Directives.directive("templateAttributeLine", templateAttributeLineDirective);
function templateAttributeLineDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeLineDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-line.html"
    };
}

Application.Controllers.controller("templateAttributeLineDirectiveController",
                                   ["$scope", templateAttributeLineDirectiveController]);
function templateAttributeLineDirectiveController($scope) {
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
            categories: [1,2,3,4,5,6]
        },
        series: [
            {
                data: [10, 20, 30, 40, 50],
                type: "line"
            }]
    };
}

Application.Directives.directive("templateAttributeList", templateAttributeListDirective);
function templateAttributeListDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeListDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-list.html"
    };
}

Application.Controllers.controller("templateAttributeListDirectiveController",
                                   ["$scope", templateAttributeListDirectiveController]);
function templateAttributeListDirectiveController($scope) {

}

Application.Directives.directive("templateAttributeNumber", templateAttributeNumberDirective);
function templateAttributeNumberDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeNumberDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-number.html"
    };
}

Application.Controllers.controller("templateAttributeNumberDirectiveController",
                                   ["$scope", "pubsub",
                                    templateAttributeNumberDirectiveController]);
function templateAttributeNumberDirectiveController($scope) {
    $scope.control = {
        edit: $scope.edit
    };

    $scope.done = function() {
        $scope.control.edit = false;
        $scope.attribute.done = true;
        if ($scope.attribute.required) {
            pubsub.send("create.sample.attribute.done");
        }
    };
}

Application.Directives.directive("templateAttributePair", templateAttributePairDirective);
function templateAttributePairDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributePairDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-pair.html"
    };
}

Application.Controllers.controller("templateAttributePairDirectiveController",
                                   ["$scope", templateAttributePairDirectiveController]);
function templateAttributePairDirectiveController($scope) {

}

Application.Directives.directive("templateAttributeString", templateAttributeStringDirective);
function templateAttributeStringDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            attribute: "=attribute",
            edit: "=edit"
        },
        controller: "templateAttributeStringDirectiveController",
        templateUrl: "application/core/components/templates/partials/attributes/template-attribute-string.html"
    };
}

Application.Controllers.controller("templateAttributeStringDirectiveController",
                                   ["$scope", "pubsub",
                                    templateAttributeStringDirectiveController]);
function templateAttributeStringDirectiveController($scope, pubsub) {
    $scope.control = {
        edit: $scope.edit
    };

    $scope.done = function() {
        $scope.control.edit = false;
        $scope.attribute.done = true;
        if ($scope.attribute.required) {
            pubsub.send("create.sample.attribute.done");
        }
    };
}
