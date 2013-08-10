var treedirective = angular.module("treedirective", []);

treedirective.directive("tree", function($compile) {
    return {
        restrict: "E",
        scope: {family: '='},
        template:
            '<p>{{ family.name }}</p>'+
                '<ul>' +
                '<li ng-repeat="child in family.children">' +
                '<tree family="child"></tree>' +
                '</li>' +
                '</ul>',
        compile: function(tElement, tAttr) {
            var contents = tElement.contents().remove();
            var compiledContents;
            return function(scope, iElement, iAttr) {
                if(!compiledContents) {
                    compiledContents = $compile(contents);
                }
                compiledContents(scope, function(clone, scope) {
                    iElement.append(clone);
                });
            };
        }
    };
});