Application.Directives.directive('wordCloud',
    function () {
        return {
            restrict: 'A',
            transclude: true,
            scope: { wordList: '=wordCloud' },

            link: function (scope, element) {
                scope.$watch('wordList', function (wordList) {
                    if (wordList) {
                        $(element).jQCloud(wordList, {});
                    }
                });
            }
        };

    });