(function (module) {
    module.directive("mathjaxBind", mathjaxBindDirective);

    function mathjaxBindDirective() {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs",
                function ($scope, $element, $attrs) {
                    $scope.$watch($attrs.mathjaxBind, function (texExpression) {
                        var texScript = angular.element("<script type='math/tex'>")
                            .html(texExpression ? texExpression : "");
                        $element.html("");
                        $element.append(texScript);
                        MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
                    });
                }]
        };
    }
}(angular.module('materialscommons')));

// ********** Keep these comments ************
// ********** They explain how to integrate mathjax ********
// http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML&delayStartupUntil=configured&dummy=.js
// jsfiddle: http://jsfiddle.net/spicyj/9UXFE/
// StackOverflow: http://stackoverflow.com/questions/16087146/getting-mathjax-to-update-after-changes-to-angularjs-model
