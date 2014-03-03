Application.Directives.directive('notification',
    function ($timeout) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                message: '='
            },
            template: '<div class="alert fade" bs-alert="message"></div>',
            link: function (scope, element) {
                scope.$watch('message', function () {
                    element.show();
                    $timeout(function () {
                        element.hide();
                    }, 5000);
                });
            }
        };

    });
