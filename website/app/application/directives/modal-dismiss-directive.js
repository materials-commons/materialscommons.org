Application.Directives.directive('modalDismiss', [function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            scope.dismissModal = function () {
                element.modal('hide');
            };
        }
    }
}]);