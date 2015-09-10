(function (module) {
    module.directive('homeReviews', homeReviewsDirective);
    function homeReviewsDirective() {
        return {
            restrict: "EA",
            controller: 'HomeReviewsDirectiveController',
            controllerAs: 'view',
            bindToController: true,
            scope: {
                project: '=project'
            },
            templateUrl: 'application/core/projects/project/home/directives/home-reviews.html'
        };
    }

    module.controller("HomeReviewsDirectiveController", HomeReviewsDirectiveController);
    HomeReviewsDirectiveController.$inject = [];
    function HomeReviewsDirectiveController() {
        var ctrl = this;

        var rowData = [];

        ctrl.project.reviews.forEach(function (review) {
            rowData.push({
                title: review.title,
                messages: review.messages,
                who: review.messages[(review.messages.length - 1)].who,
                mtime: review.messages[(review.messages.length - 1)].date
            });
        });

        var columnDefs = [
            {
                displayName: "",
                field: "title",
                width: 300,
                template: '<span ng-bind="data.title"></span>' +
                '<p><small class="text-muted"><i class="fa fa-fw fa-user"></i>' +
                '<span  class="text-muted" ng-bind="data.who"></span>' +
                '<small  style="padding-left: 60px;" ng-bind="data.mtime"></small></small></p>',
                cellStyle: {border: 0}
            },
            {
                displayName: "",
                field: "messages",
                width: 620,
                template: '<span class="pull-right">' +
                '<a ng-if="data.messages.length !== 0" class="fa-stack fa-2x">' +
                '<i style="color: #FDAC6B;" class="fa fa-comment fa-stack-1x"></i>' +
                '<i style="font-size: 10px;" class="fa fa-stack-1x fa-inverse">{{data.messages.length}}</i>' +
                '</span>',
                cellStyle: {border: 0}
            }
        ];

        ctrl.gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            enableColResize: true,
            headerHeight: 0,
            rowHeight: 65,
            rowStyle: {'border-bottom': 'dotted #d3d3d3'},
            angularCompileRows: true
        };
    }

}(angular.module('materialscommons')));
