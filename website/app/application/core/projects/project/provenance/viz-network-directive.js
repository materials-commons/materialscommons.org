Application.Directives.directive('visNetwork', visNetworkDirective);

function visNetworkDirective() {
    return {
        restrict: 'E',
        require: '^ngModel',
        scope: {
            ngModel: '=',
            onSelect: '&',
            options: '='
        },
        link: function($scope, $element, $attrs, ngModel) {
           $scope.$watch('ngModel', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    // You actions here
                    var network = new vis.Network($element[0], $scope.ngModel, $scope.options || {});

                    var onSelect = $scope.onSelect() || function(prop) {};
                    network.on('select', function(properties) {
                        onSelect(properties);
                    });
                }
            }, true);
            var network = new vis.Network($element[0], $scope.ngModel, $scope.options || {});

            var onSelect = $scope.onSelect() || function(prop) {};
            network.on('select', function(properties) {
                onSelect(properties);
            });

        }
    };
}
