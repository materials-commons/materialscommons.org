Application.Directives.directive('notification', function ($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div class="alert fade" bs-alert="ngModel">Hello world</div>',
        link: function (scope, element) {
            scope.$watch('ngModel', function () {
                element.show();
                $timeout(function () {
                    element.hide();
                }, 5000);
            });
        }
    };
});