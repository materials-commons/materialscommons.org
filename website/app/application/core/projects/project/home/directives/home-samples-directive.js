(function (module) {
    module.directive('homeSamples', homeSamplesDirective);

    function homeSamplesDirective() {
        return {
            restrict: "A",
            controller: 'HomeSamplesController',
            controllerAs: 'view',
            bindToController: true,
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/home/directives/home-samples.html'
        };
    }

    module.controller("HomeSamplesController", HomeSamplesController);
    HomeSamplesController.$inject = ["$filter", "modalInstance"];

    /* @ngInject */
    function HomeSamplesController($filter, modalInstance) {
        var ctrl = this;
        var rowData = [];
        var samples = $filter('orderBy')(ctrl.project.samples, 'name');

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

        ctrl.gridOptions = {
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
            var i = _.indexOf(ctrl.project.samples, function (sample) {
                return sample.id == params.data.id;
            });
            if (i !== -1) {
                modalInstance.openModal(ctrl.project.samples[i], 'sample', ctrl.project);
            }
        }
    }
}(angular.module('materialscommons')));
