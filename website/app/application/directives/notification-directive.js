//Application.Directives.directive('notification',
//    function ($timeout) {
//        return {
//            restrict: 'E',
//            replace: true,
//            scope: {
//                ngModel: '='
//            },
//            template: '<div class="alert fade" bs-alert="ngModel"></div>',
//            link: function (scope, element) {
//                scope.$watch('ngModel', function () {
//                    element.show();
//                    $timeout(function () {
//                        element.hide();
//                    }, 3500);
//                });
//            }
//        };
//
//    });

Application.Directives.directive('notification', function ($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '='
        },
        template: '<div class="alert fade" bs-alert="ngModel"></div>',
        link: function (scope, element) {
            scope.$watch('ngModel', function () {
                element.show();
                $timeout(function () {
                    element.hide();
                }, 3000);
            });
        }
    };
});