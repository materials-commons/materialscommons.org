Application.Controllers.controller("nodeDetailsController",
                                   ["$scope", "$timeout", nodeDetailsController]);

function nodeDetailsController($scope, $timeout) {
    var data = [];
    var value = 0;
    for (var i = 0; i < 1000; i++) {
        value = Math.floor((Math.random() * 20)+1);
        data.push(value);
    }
    $scope.chartConfig = {
        options: {
            chart: {
                type: "areaspline"
            }
        },
        series: [
            {
                name: "SEM Run 1",
                data: data,
                type: "scatter",
                connectNulls: true
            }
        ],
        title: {
            text: "Stress/Strain"
        },
        loading: false
    };

    $scope.chartConfig2 = {
        options: {
            chart: {
                type: 'column'
            }
        },
        title: {
            text: "Grain Size Distribution"
        },
        xAxis: {
            categories: ["Grain1", "Grain2", "Grain3"]
        },
        yAxis: {
            min: 0,
            title: {
                text: "Max Grain Size"
            }
        },
        plotOptions: {
            column: {
                stacking: 'percent'
            }
        },
        series: [
            {
                name: "SEM Run1",
                data: [5, 3, 2, 7, 1]
            },
            {
                name: "SEM Run2",
                data: [19, 15, 7, 0, 6, 5]
            },
            {
                name: "SEM Run3",
                data: [4, 2, 3]
            }
        ]
    };

    $scope.dynamicChartConfig = {
        options: {
            chart: {
                type: "scatter",
                margin: [70,50,60,80],
                events: {
                    click: function(e) {
                        console.log("events click called");
                        var x = e.xAxis[0].value,
                            y = e.yAxis[0].value,
                            series = this.series[0];
                        series.addPoint([x,y]);
                    }
                }
            },
            plotOptions: {
                scatter: {
                    lineWidth: 20,
                    point: {
                        events: {
                            'click': function() {
                                if (this.series.data.length > 1) {
                                    console.log("click called");
                                    this.remove();
                                }
                            }
                        }
                    }
                }
            }
        },
        title: {
            text: "User supplied data"
        },
        subtitle: {
            text: "Click the plot area to add a point. Click a point to remove it."
        },
        xAxis: {
            gridLineWidth: 1,
            minPadding: 0.2,
            maxPadding: 0.2,
            maxZoom: 60
        },
        yAxis: {
            title: {
                text: "Value"
            },
            minPadding: 0.2,
            maxPadding: 0.2,
            maxZoom: 60,
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: "green"
                }
            ]
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [
            {
                data: [[20, 20], [80, 80]]
            }
        ]
    };
}
