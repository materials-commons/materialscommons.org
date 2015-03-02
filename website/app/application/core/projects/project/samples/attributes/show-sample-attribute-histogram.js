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

}
