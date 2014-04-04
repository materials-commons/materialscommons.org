Application.Directives.directive('cgroup',
    function () {    return {
        restrict: "E",
        transclude: true,
        scope: {
            label: '@label'
        },
        template: '<div class="control-group">' +
            '<label class="control-label">{{ label }}</label>' +
            '<div class="controls" ng-transclude>' +
            '</div>' +
            '</div>'
    }
});

Application.Directives.directive('cgrouprequired',
    function () {    return {
        restrict: "E",
        transclude: true,
        scope: {
            label: '@label'
        },
        template: '<div class="control-group">' +
            '<label class="control-label">{{ label }} <i class="fa fa-asterisk" style="color: red"></i> </label>' +
            '<div class="controls" ng-transclude>' +
            '</div>' +
            '</div>'
    }
    });