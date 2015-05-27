Application.Directives.directive('visNetwork', visNetworkDirective);

function visNetworkDirective() {
    return {
        restrict: 'E',
        require: '^ngModel',
        scope: {
            ngModel: '=',
            onSelect: '&',
            options: '=',
            onLoaded: '&'
        },
        link: function($scope, $element, $attrs, ngModel) {
           $scope.$watch('ngModel', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    network.setData($scope.ngModel);
                }
            }, true);
            var network = new vis.Network($element[0], $scope.ngModel, $scope.options || {});

            var onLoaded = $scope.onLoaded() || function(){};
            onLoaded(network);

            var onSelect = $scope.onSelect() || function(prop) {};
            network.on('select', function(properties) {
                onSelect(properties);
            });
        }
    };
}
