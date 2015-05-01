Application.Directives.directive('homeSamples', homeSamplesDirective);

function homeSamplesDirective() {
    return {
        restrict: "A",
        controller: 'homeSamplesController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-samples.html'
    };
}

Application.Controllers.controller("homeSamplesController",
                                   ["$scope",
                                    homeSamplesController]);

function homeSamplesController($scope) {

    var rowData = [];
    $scope.project.samples.forEach(function (sample) {
        rowData.push({
            name: sample.title,
            composition: n ,
            owner: sample.owner,
            mtime: sample.mtime
        });
    });
    var columnDefs = [
        {
            displayName: "",
            field: "title",
            width: 900,
            template: '<span ng-bind="data.title"></span>' +
            '<p class="text-muted"><small><i class="fa fa-fw fa-user"></i>' +
            '<span  class="text-muted">{{data.owner}}</span>' +
            '<small  style="padding-left: 60px;">{{data.mtime | toDateString}}</small></small></p>' +
            '<div style="font-size: 12px;" class="text-muted" ta-bind="text" ng-model="data.msg"></div>',
            cellStyle: {border: 0}
        }
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 85,
        rowStyle: {'border-bottom': 'dotted #d3d3d3'},
        angularCompileRows: true
    };

}
