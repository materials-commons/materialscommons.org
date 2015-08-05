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
    ["$scope", "$filter", "modalInstance", homeSamplesController]);

function homeSamplesController($scope, $filter, modalInstance) {
    var rowData = [];
    var samples = $filter('orderBy')($scope.project.samples, 'name');
    samples.forEach(function (sample) {
        var composition = '';
        if ('composition' in sample.properties) {
            sample.properties.composition.value.forEach(function (val) {
                composition = composition + '  ' + val.element + ': ' + val.value;
            });
            composition = composition + '  ' + sample.properties.composition.unit;
        } else {
            composition = 'unknown';
        }
        rowData.push({
            name: sample.name,
            owner: sample.owner,
            mtime: sample.mtime,
            id: sample.id
        });
    });
    var columnDefs = [
        {
            displayName: "",
            field: "title",
            width: 900,
            template: '<div class="cursor-pointer"><span ng-bind="data.name"></span>' +
            '<p class="text-muted"><small>' +
            '<i class="fa fa-fw fa-user"></i>' +
            '<span  class="text-muted">{{data.owner}}</span>' +
            '<small  style="padding-left: 60px;">{{data.mtime | toDateString}}</small></small></p></div>',
            cellStyle: {border: 0}
        }
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        rowClicked: rowClicked,
        enableColResize: true,
        headerHeight: 0,
        rowHeight: 65,
        rowStyle: {'border-bottom': 'dotted #d3d3d3'},
        angularCompileRows: true
    };

    function rowClicked(params) {
        var i = _.indexOf($scope.project.samples, function (sample) {
            return sample.id == params.data.id;
        });
        if (i !== -1) {
            modalInstance.openModal($scope.project.samples[i], 'sample', $scope.project);
        }
    }
}
