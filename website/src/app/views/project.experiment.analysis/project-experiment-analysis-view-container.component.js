class MCProjectExperimentAnalysisViewContainerComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            series: ['Series A', 'Series B'],
            data: [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90]
            ],
            datasetOverride: [{yAxisID: 'y-axis-1'}, {yAxisID: 'y-axis-2'}],
            options: {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left'
                        },
                        {
                            id: 'y-axis-2',
                            type: 'linear',
                            display: true,
                            position: 'right'
                        }
                    ]
                }
            },
            charts: ['bar', 'line'],
            selectedChart: "",
        };
    }

    onClick(points, evt) {
        console.log(points, evt);
    }

    /*
     $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };
  $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
  $scope.options = {
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          type: 'linear',
          display: true,
          position: 'left'
        },
        {
          id: 'y-axis-2',
          type: 'linear',
          display: true,
          position: 'right'
        }
      ]
    }
  };
});
     */

    $onInit() {

    }
}

angular.module('materialscommons').component('mcProjectExperimentAnalysisViewContainer', {
    controller: MCProjectExperimentAnalysisViewContainerComponentController,
    template: require('./project-experiment-analysis-view-container.html')
});