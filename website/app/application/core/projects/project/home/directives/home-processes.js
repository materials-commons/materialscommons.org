(function (module) {
    module.directive('homeProcesses', homeProcessesDirective);
    function homeProcessesDirective() {
        return {
            restrict: "EA",
            controller: 'HomeProcessesDirectiveController',
            controllerAs: 'view',
            bindToController: true,
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/home/directives/home-processes.html'
        };
    }

    module.controller("HomeProcessesDirectiveController", HomeProcessesDirectiveController);
    HomeProcessesDirectiveController.$inject = ["$scope", "pubsub", "$filter", "modalInstance"];

    /* @ngInject */
    function HomeProcessesDirectiveController($scope, pubsub, $filter, modalInstance) {
        var ctrl = this;

        pubsub.waitOn($scope, "processes.change", function () {
            segmentProcesses();
        });

        segmentProcesses();

        ///////////////////////

        function segmentProcesses() {
            var columnDefs = [
                {
                    displayName: "",
                    field: "name",
                    width: 300,
                    template: '<div class="cursor-pointer"><span ng-bind="data.name"></span>' +
                    '<p><small><small  class="text-muted">{{data.mtime | toDateString}}</small></small></p></div>',
                    cellStyle: {border: 0}
                },
                {
                    displayName: "",
                    field: "owner",
                    width: 300,
                    template: '<div class="cursor-pointer"><span ng-bind="data.owner"></span></div>',
                    cellStyle: {border: 0}
                },
                {displayName: "", field: "", width: 300, cellStyle: {border: 0}}
            ];
            var rowData = [];
            var processes = $filter('orderBy')(ctrl.project.processes, 'name');
            processes.forEach(function (process) {
                rowData.push({name: process.name, owner: process.owner, mtime: process.mtime, id: process.id});
            });

            ctrl.gridOptions = {
                columnDefs: columnDefs,
                rowData: rowData,
                rowClicked: rowClicked,
                enableColResize: true,
                headerHeight: 0,
                rowHeight: 60,
                angularCompileRows: true
            };
        }

        function rowClicked(params) {
            var i = _.indexOf(ctrl.project.processes, function (proc) {
                return proc.id == params.data.id;
            });
            if (i !== -1) {
                modalInstance.openModal(ctrl.project.processes[i], 'process', ctrl.project);
            }
        }
    }
}(angular.module('materialscommons')));
