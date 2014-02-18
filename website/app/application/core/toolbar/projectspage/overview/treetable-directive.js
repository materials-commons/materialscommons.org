Application.Directives.directive('treetable',
    function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                treedata: '='
            },
            link: function (scope, element) {
                scope.$watch('treedata', function (newValue, oldValue) {
                    if (newValue) {
                        $timeout(function () {
                            $(element).treetable({expandable: true}, true);
                        }, 0);
                    }
                });
            }
        };
    });
