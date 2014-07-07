Application.Directives.directive('cgroup',
    function () {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                label: '@label'
            },
            template: '<div class="form-group">' +
                '<label class="control-label col-sm-2">{{ label }}</label>' +
                '<div class="input-group col-sm-4" ng-transclude>' +
                '</div>' +
                '</div>'
        };
    });

Application.Directives.directive('cgrouprequired',
    function () {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                label: '@label'
            },
            template: '<div class="form-group">' +
                '<label class="control-label col-sm-2">{{ label }} <i class="fa fa-asterisk" style="color: red"></i> </label>' +
                '<div class="input-group col-sm-4" ng-transclude>' +
                '</div>' +
                '</div>'
        };
    });

Application.Directives.directive('display',
    function () {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                label: '@label'
            },
            template: '<div class="row" style="word-wrap: break-word">' +
                '<div class="col-lg-4">' +
                '<label> {{ label }}</label>' +
                '</div>' +
                '<div class="col-lg-8" ng-transclude>' +
                '</div> ' +
                '</div>'
        };
    });
